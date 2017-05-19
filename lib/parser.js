const Root = require('postcss/lib/root');
const htmlParser = require('./html-parse');
const getSyntax = require('./get-syntax');

function parser (code, opts) {
	const styles = htmlParser(code);
	if (!styles) {
		return;
	}
	const document = new Root();
	let index = 0;
	styles.forEach(style => {
		const syntax = getSyntax(opts, (style.attribute && style.attribute.lang));
		const root = syntax.parse(style.content, opts);
		style.fixLocal(root);
		root.raws.before = code.slice(index, style.startIndex);
		root.stringify = syntax.stringify;
		index = style.endIndex;
		document.nodes.push(root);
	});
	document.raws.after = code.slice(index);

	document.stringify = function (document, builder) {
		document.nodes.forEach(root => {
			builder(root.raws.before, root, 'start');
			root.stringify(root, builder);
		});
		builder(document.raws.after, document, 'end');
	};
	return document;
}

module.exports = parser;
