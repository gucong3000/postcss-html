'use strict';

const Input = require('postcss/lib/input');
const Root = require('postcss/lib/root');
const htmlParser = require('./html-parser');
const getSyntax = require('./get-syntax');
const LocalFixer = require('./local-fixer');

function getLang (attribute) {
	if (!attribute) {
		return;
	}
	const lang = attribute.type && /^\w+\/(\w+)$/.exec(attribute.type);
	if (lang) {
		return lang[1];
	}
	return attribute.lang || 'css';
}

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
		const syntax = getSyntax(opts, getLang(style.attribute));
		const localFixer = documentLocalFixer.block(style.startIndex);
		const root = localFixer.throws(() => syntax.parse(style.content, opts));
		localFixer.root(root);
		root.raws.beforeStart = source.slice(index, style.startIndex);
		root.stringify = syntax.stringify;
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
