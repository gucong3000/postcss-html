const htmlparser = require('htmlparser2');
const reNewLine = /(?:\r?\n|\r)/gm;

function iterateCode (code, onStyleTag, onStyleAttribute) {
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

	parser.parseComplete(code);

	return isStructureHTML;
}

function getCodeLines (code) {
	let match;
	const lines = [];
	reNewLine.lastIndex = 0;
	while ((match = reNewLine.exec(code))) {
		lines.push(match.index);
	}
	return lines;
}

function getlocationMap (lines, index) {
	let line;
	let column;
	if (lines.some((lineEndIndex, lineNumber) => {
		if (lineEndIndex >= index) {
			line = lineNumber--;
			if (lineNumber < 0) {
				column = index;
			} else {
				column = index - lines[lineNumber];
			}
			return true;
		}
	})) {
		column--;
		return {
			line,
			column,
		};
	}
}

function applyLocationMap (obj, map) {
	if (obj.line === 1) {
		obj.column += map.column;
	}
	obj.line += map.line;
}

function fixLocation (node, map) {
	applyLocationMap(node.source.start, map);
	applyLocationMap(node.source.end, map);
}

function htmlParse (code) {
	const styles = [];
	function onStyleTag (style) {
		styles.push(style);
	}
	function onStyleAttribute (content, index) {
		styles.push({
			content: content,
			startIndex: code.indexOf(content, index),
		});
	}
	const isStructureHTML = iterateCode(code, onStyleTag, onStyleAttribute);

	if (isStructureHTML) {
		const lines = getCodeLines(code);
		return styles.sort(function (a, b) {
			return a.startIndex - b.startIndex;
		}).map(style => {
			style.fixLocal = function (root) {
				const map = getlocationMap(lines, style.startIndex);
				applyLocationMap(root.source.start, map);
				root.walk(node => {
					fixLocation(node, map);
				});
			};
			return style;
		});
	}
}

module.exports = htmlParse;

