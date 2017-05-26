'use strict';
const reNewLine = /(?:\r?\n|\r)/gm;
const getSyntax = require('./get-syntax');

function getSubString (str, regexp) {
	const subStr = str && regexp.exec(str);
	if (subStr) {
		return subStr[1];
	}
}

function getLang (attribute) {
	if (!attribute) {
		return;
	}
	return getSubString(attribute.type, /^\w+\/(\w+)$/) || getSubString(attribute.lang, /^(\w+)(?:\?.+)?$/) || 'css';
}

function DocumentFixer (source) {
	let match;
	const lines = [];
	reNewLine.lastIndex = 0;
	while ((match = reNewLine.exec(source))) {
		lines.push(match.index);
	}
	this.lines = lines;
}

DocumentFixer.prototype = {
	block: function (style) {
		return new LocalFixer(this.lines, style);
	},
};

function LocalFixer (lines, style) {
	let line = 0;
	let column = style.startIndex;
	lines.some((lineEndIndex, lineNumber) => {
		if (lineEndIndex >= style.startIndex) {
			line = lineNumber--;
			if (lineNumber in lines) {
				column = style.startIndex - lines[lineNumber] - 1;
			}
			return true;
		}
	});

	this.line = line;
	this.column = column;
	this.style = style;
}

LocalFixer.prototype = {
	object: function (object) {
		if (object.line === 1) {
			object.column += this.column;
		}
		object.line += this.line;
	},
	node: function (node) {
		this.object(node.source.start);
		this.object(node.source.end);
	},
	root: function (root) {
		this.object(root.source.start);
		root.walk(node => {
			this.node(node);
		});
	},
	error: function (error) {
		if (error && error.name === 'CssSyntaxError') {
			this.object(error);
			this.object(error.input);
			error.message = error.message.replace(/:\d+:\d+:/, ':' + error.line + ':' + error.column + ':');
		}
		return error;
	},
	parse: function (opts) {
		const style = this.style;
		const syntax = getSyntax(opts, getLang(style.attribute));
		let root;
		try {
			root = syntax.parse(style.content, opts);
		} catch (error) {
			throw this.error(error);
		}
		this.root(root);
		root.stringify = syntax.stringify;
		return root;
	},
};

module.exports = DocumentFixer;
