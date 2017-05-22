'use strict';

const Input = require('postcss/lib/input');
const Root = require('postcss/lib/root');
const htmlParser = require('./html-parser');
const getSyntax = require('./get-syntax');

function getLang (attribute) {
	if (!attribute) {
		return;
	}
	const lang = attribute.type && /^\w+\/(\w+)$/.exec(attribute.type);
	if (lang) {
		return lang[1];
	}
	return attribute.lang;
}

function parser (source, opts) {
	const styles = htmlParser(source);
	if (!styles) {
		return;
	}
	const document = new Root();
	let index = 0;
	styles.forEach(style => {
		const syntax = getSyntax(opts, getLang(style.attribute) || 'css');
		const root = syntax.parse(style.content, opts);
		style.fixLocal(root);
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
