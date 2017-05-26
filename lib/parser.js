'use strict';

const Input = require('postcss/lib/input');
const Root = require('postcss/lib/root');
const htmlParser = require('./html-parser');
const LocalFixer = require('./local-fixer');

function parser (source, opts) {
	source = source && source.toString();
	const styles = htmlParser(source);
	if (!styles) {
		return;
	}
	const document = new Root();
	const documentLocalFixer = new LocalFixer(source);
	let index = 0;
	styles.forEach(style => {
		const localFixer = documentLocalFixer.block(style);
		const root = localFixer.parse(opts);
		root.raws.beforeStart = source.slice(index, style.startIndex);
		index = style.startIndex + style.content.length;
		document.push(root);
	});
	document.raws.afterEnd = source.slice(index);
	document.source = {
		input: new Input(source, opts),
		start: {
			line: 1,
			column: 1,
		},
	};

	document.stringify = function (document, builder) {
		document.nodes.forEach(root => {
			builder(root.raws.beforeStart, root, 'start');
			root.stringify(root, builder);
		});
		builder(document.raws.afterEnd, document, 'end');
	};
	return document;
}

module.exports = parser;
