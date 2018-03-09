"use strict";

const Input = require("postcss/lib/input");
const Root = require("postcss/lib/root");
const htmlParser = require("./html-parser");
const mdParser = require("./markdown-parser");
const BlockFixer = require("./block-fixer");

function parser (source, opts) {
	function filenameMatch (reg) {
		return opts.from && reg.test(opts.from);
	}
	// Skip known style sheet files.
	if (filenameMatch(/\.(?:(?:\w*c|wx|le|sa|s)ss|styl(?:us)?)(?:\?.+)?$/i)) {
		return;
	}

	source = source && source.toString();
	const styleTag = htmlParser(source, opts);
	const stylesMd = mdParser(source, opts);
	if (!styleTag && !stylesMd && !filenameMatch(/\.(?:md|markdown)$/i)) {
		return;
	}
	const document = new Root();
	const documentLocalFixer = new BlockFixer(source);
	let index = 0;
	[].concat(styleTag, stylesMd).filter(Boolean).sort(function (a, b) {
		return a.startIndex - b.startIndex;
	}).forEach(style => {
		const localFixer = documentLocalFixer.block(style);
		const root = localFixer.parse(opts);
		root.raws.beforeStart = source.slice(index, style.startIndex);
		index = style.startIndex + style.content.length;
		document.nodes.push(root);
	});
	document.raws.afterEnd = source.slice(index);
	document.source = {
		input: new Input(source, opts),
		start: {
			line: 1,
			column: 1,
		},
	};

	document.each = function (callback) {
		let wasBreak, lastResult;
		this.nodes.forEach(node => {
			const result = node.each(callback);
			if (result === false) {
				wasBreak = true;
			} else {
				lastResult = result;
			}
		});
		if (wasBreak) {
			return false;
		} else {
			return lastResult;
		}
	};

	document.append = function () {
		this.last.append.apply(
			this.last,
			Array.from(arguments)
		);
		return this;
	};

	document.prepend = function () {
		this.first.prepend.apply(
			this.first,
			Array.from(arguments)
		);
		return this;
	};

	document.insertBefore = function (exist, add) {
		exist.prepend(add);
		return this;
	};

	document.insertAfter = function (exist, add) {
		exist.append(add);
		return this;
	};

	return document;
}

module.exports = parser;
