'use strict';

const htmlparser = require('htmlparser2');

function iterateCode (source, onStyleTag, onStyleAttribute) {
	let currentStyle = null;
	let isStructureHTML = false;

	const parser = new htmlparser.Parser({
		onopentag (name, attribute) {
			// Found a tag, the structure is now confirmed as HTML
			isStructureHTML = true;

			// Test if current tag is a valid <style> tag.
			if (name !== 'style') {
				return;
			}
			currentStyle = {
				attribute,
			};
			currentStyle.startIndex = parser.endIndex + 1;
			currentStyle.content = '';
		},

		onclosetag (name) {
			if (name !== 'style' || currentStyle === null) {
				return;
			}
			onStyleTag(currentStyle);
			currentStyle = null;
		},

		ontext (data) {
			if (!currentStyle) {
				return;
			}
			currentStyle.content += data;
		},

		onattribute (name, value) {
			if (name !== 'style') {
				return;
			}
			onStyleAttribute(value, parser.endIndex);
		},
	});

	parser.parseComplete(source);

	return isStructureHTML;
}

function getSubString (str, regexp) {
	const subStr = str && regexp.exec(str);
	if (subStr) {
		return subStr[1].toLowerCase();
	}
}

function getLang (attribute) {
	return getSubString(attribute.type, /^\w+\/(\w+)$/) || getSubString(attribute.lang, /^(\w+)(?:\?.+)?$/) || 'css';
}

function htmlParser (source) {
	const styles = [];
	function onStyleTag (style) {
		const firstNewLine = /^\r?\n/.exec(style.content);
		style.lang = getLang(style.attribute);
		if (firstNewLine) {
			const offset = firstNewLine[0].length;
			style.startIndex += offset;
			style.content = style.content.slice(offset).replace(/[ \t]*$/, '');
		}
		styles.push(style);
	}
	function onStyleAttribute (content, index) {
		styles.push({
			content: content,
			startIndex: source.indexOf(content, index),
		});
	}
	const isStructureHTML = iterateCode(source, onStyleTag, onStyleAttribute);

	if (!isStructureHTML) {
		return;
	}

	return styles;
}

module.exports = htmlParser;

