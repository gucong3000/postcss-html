"use strict";

const htmlparser = require("htmlparser2");
const loadSyntax = require("postcss-syntax/load-syntax");

function iterateCode (source, onStyleTag, onStyleAttribute) {
	let style;
	const openTag = {};

	const parser = new htmlparser.Parser({
		onopentag (name, attribute) {
			// Test if current tag is a valid <style> tag.
			if (!/^style$/i.test(name)) {
				openTag[name] = true;
				return;
			}

			style = {
				inHtml: openTag.html,
				tagName: name,
				attribute,
				startIndex: parser.endIndex + 1,
			};
		},

		onclosetag (name) {
			if (name !== "style" || !style) {
				openTag[name] = false;
				return;
			}

			let content = source.slice(style.startIndex, parser.startIndex);

			const firstNewLine = /^[ \t]*\r?\n/.exec(content);
			if (firstNewLine) {
				const offset = firstNewLine[0].length;
				style.startIndex += offset;
				content = content.slice(offset);
			}
			style.content = content.replace(/[ \t]*$/, "");

			onStyleTag(style);
			style = null;
		},

		onattribute (name, content) {
			if (name !== "style") {
				return;
			}
			const endIndex = parser._tokenizer._index;
			const startIndex = endIndex - content.length;
			if (source[startIndex - 1] !== source[endIndex] || !/\S/.test(source[endIndex])) {
				return;
			}
			onStyleAttribute({
				content,
				startIndex,
				inline: true,
				inTemplate: openTag.template,
			});
		},
	});

	parser.parseComplete(source);
}

function getSubString (str, regexp) {
	const subStr = str && regexp.exec(str);
	if (subStr) {
		return subStr[1].toLowerCase();
	}
}

function getLang (attribute) {
	return getSubString(attribute.type, /^\w+\/(?:x-)?(\w+)$/i) || getSubString(attribute.lang, /^(\w+)(?:\?.+)?$/) || "css";
}

function htmlParser (source, opts, styles) {
	styles = styles || [];

	const standard = opts.from && /\.(?:[sx]?html?|[sx]ht|markdown|md)$/i.test(opts.from);

	function onStyleTag (style) {
		if (!(style.inHtml || standard) && (style.attribute.src || style.attribute.href) && !style.content.trim()) {
			return;
		}
		style.lang = getLang(style.attribute);
		styles.push(style);
	}

	function onStyleAttribute (style) {
		if (style.inTemplate && /\{\{[\s\S]*?\}\}/g.test(style.content)) {
			style.syntax = loadSyntax(opts, __dirname);
			style.lang = "custom-template";
		} else {
			style.lang = "css";
		}
		styles.push(style);
	}

	iterateCode(source, onStyleTag, onStyleAttribute);

	return styles;
}

module.exports = htmlParser;
