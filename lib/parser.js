"use strict";

const Input = require("postcss/lib/input");
const Document = require("./document");
const jsParser = require("./js-parser");
const htmlParser = require("./html-parser");
const mdParser = require("./md-parser");
const docFixer = require("./parse-style");

function parser (source, opts) {
	function filenameMatch (reg) {
		return opts.from && reg.test(opts.from);
	}
	// Skip known style sheet files.
	if (filenameMatch(/\.(?:(?:\w*c|wx|le|sa|s)ss|styl(?:us)?)(?:\?.*)?$/i)) {
		return;
	}

	source = source && source.toString();

	const styleJs = filenameMatch(/\.(?:m?[jt]sx?|es\d*|pac)(?:\?.*)?$/i) && jsParser(source, opts);
	const styleHtm = !styleJs && htmlParser(source, opts);
	const styleMd = !styleJs && mdParser(source, opts);
	if (!styleJs && !styleHtm && !styleMd && !filenameMatch(/\.(?:md|markdown|[sx]?html?|[sx]ht|vue|ux|php)(?:\?.*)?$/i)) {
		return;
	}
	const document = new Document();
	const parseStyle = docFixer(source, opts);
	let index = 0;
	[].concat(styleJs, styleHtm, styleMd).filter(Boolean).sort((a, b) => {
		return a.startIndex - b.startIndex;
	}).forEach(style => {
		const root = parseStyle(style);
		root.raws.beforeStart = source.slice(index, style.startIndex);
		index = style.startIndex + style.content.length;
		document.nodes.push(root);
	});
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
