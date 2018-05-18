"use strict";

const htmlparser = require("htmlparser2");

function iterateCode (source, onStyleTag, onStyleAttribute) {
	const currentTag = {};

	const parser = new htmlparser.Parser({
		onopentag (name, attribute) {
			// Test if current tag is a valid <style> tag.
			if (!/^style$/i.test(name) || attribute.src || attribute.href) {
				return;
			}

			currentTag[name] = {
				tagName: name,
				attribute,
				startIndex: parser.endIndex + 1,
			};
		},

		onclosetag (name) {
			const tag = currentTag[name];
			if (!tag) {
				return;
			}
			currentTag[name] = null;
			tag.content = source.slice(tag.startIndex, parser.startIndex);
			onStyleTag(tag);
		},

		onattribute (name, value) {
			if (name !== "style") {
				return;
			}
			onStyleAttribute(value, parser._tokenizer._index);
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
	function onStyleTag (style) {
		const firstNewLine = /^[ \t]*\r?\n/.exec(style.content);
		style.lang = getLang(style.attribute);
		if (firstNewLine) {
			const offset = firstNewLine[0].length;
			style.startIndex += offset;
			style.content = style.content.slice(offset);
		}
		style.content = style.content.replace(/[ \t]*$/, "");
		styles.push(style);
	}
	function onStyleAttribute (content, endIndex) {
		const startIndex = endIndex - content.length;
		if (source[startIndex - 1] === source[endIndex] && /\S/.test(source[endIndex])) {
			styles.push({
				content: content,
				startIndex,
				inline: true,
			});
		}
	}
	iterateCode(source, onStyleTag, onStyleAttribute);

	return styles;
}

module.exports = htmlParser;
