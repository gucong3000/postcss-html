'use strict';
const reNewLine = /(?:\r?\n|\r)/gm;

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
	block: function (startIndex) {
		return new LocalFixer(this.lines, startIndex);
	},
};

function LocalFixer (lines, startIndex) {
	let line = 0;
	let column = startIndex;
	lines.some((lineEndIndex, lineNumber) => {
		if (lineEndIndex >= startIndex) {
			line = lineNumber--;
			if (lineNumber in lines) {
				column = startIndex - lines[lineNumber] - 1;
			}
			return true;
		}
	});

	this.line = line;
	this.column = column;
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
	throws: function (callback) {
		try {
			return callback();
		} catch (error) {
			if (error && error.name === 'CssSyntaxError') {
				this.object(error);
				this.object(error.input);
				error.message = error.message.replace(/:\d+:\d+:/, ':' + error.line + ':' + error.column + ':');
			}

			throw error;
		}
	},
};

module.exports = DocumentFixer;
