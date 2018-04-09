"use strict";

const Input = require("postcss/lib/input");
const Document = require("./document");
const docFixer = require("./parse-style");
const htmlParser = require("./html-parser");

function parser (source, opts) {
	function filenameMatch (reg) {
		return opts.from && reg.test(opts.from);
	}
	// Skip known style sheet and script files.
	if (filenameMatch(/\.(?:(?:\w*c|wx|le|sa|s)ss|styl(?:us)?|m?[jt]sx?|es\d*|pac)(?:\?.*)?$/i)) {
		return;
	}

	source = source && source.toString();

	const styleHtm = htmlParser(source, opts);
	if (!styleHtm && !filenameMatch(/\.(?:[sx]?html?|[sx]ht|vue|ux|php)(?:\?.*)?$/i)) {
		return;
	}
	const document = new Document();

	let index = 0;
	if (styleHtm) {
		const parseStyle = docFixer(source, opts);
		styleHtm.sort((a, b) => {
			return a.startIndex - b.startIndex;
		}).forEach(style => {
			const root = parseStyle(style);
			root.raws.beforeStart = source.slice(index, style.startIndex);
			index = style.startIndex + style.content.length;
			document.nodes.push(root);
		});
	}
	document.raws.afterEnd = index ? source.slice(index) : source;
	document.source = {
		input: new Input(source, opts),
		start: {
			line: 1,
			column: 1,
		},
	};

	return document;
}

module.exports = parser;
