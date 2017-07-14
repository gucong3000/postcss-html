'use strict';

function getBaseIndent (source) {
	const match = source.match(/^[ \t]*(?=\S)/gm);
	if (!match || match.some(indent => !indent)) {
		return '';
	}

	match.sort((indent1, indent2) => {
		return indent1.length - indent2.length;
	});
	return match[0];
}

function stringify (document, builder) {
	const syntaxCache = this.cache;
	const syntax = syntaxCache.get(document);
	if (syntax) {
		return syntax.stringify(document, builder);
	} else {
		document.nodes.forEach(root => {
			builder(root.raws.beforeStart, root, 'beforeStart');
			const {syntax, opts} = syntaxCache.get(root);
			if (opts.reIndent) {
				let source = root.toString(syntax);
				if (root.source.input.css !== source) {
					const baseIndent = getBaseIndent(root.source.input.css);
					if (baseIndent && !getBaseIndent(source)) {
						source = source.replace(/^(?!\s*$)/mg, baseIndent);
					}
				}
				builder(source, root, 'end');
			} else {
				syntax.stringify(root, builder);
			}
		});
		builder(document.raws.afterEnd, document, 'end');
	}
}

module.exports = stringify;
