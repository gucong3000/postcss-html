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

function htmlParse (source) {
	const styles = [];
	function onStyleTag (style) {
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

	return styles.filter(style => {
		return style.content.trim();
	}).sort(function (a, b) {
		return a.startIndex - b.startIndex;
	});
}

module.exports = htmlParse;

