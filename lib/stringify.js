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

function removeNodeSpace (root) {
	root.walk(node => {
		if (node.type === 'decl') {
			node.value = removeSpace(node.value);
		}
		node.raws.before = removeSpace(node.raws.before);
		node.raws.after = removeSpace(node.raws.after);
	});
}

function removeSpace (str) {
	return str && str.replace(/\s*[\r\n]+\s*/g, ' ');
}

function stringify (document, builder) {
	const syntaxCache = this.cache;
	const syntax = syntaxCache.get(document);
	if (syntax && syntax.stringify) {
		return syntax.stringify(document, builder);
	} else {
		document.nodes.forEach(root => {
			builder(root.raws.beforeStart, root, 'beforeStart');
			const {
				isAttribute,
				syntax,
				opts,
			} = syntaxCache.get(root);
			if (isAttribute) {
				removeNodeSpace(root);
			} else if (opts.reIndent) {
				let source = root.toString(syntax);
				if (root.source.input.css !== source) {
					const baseIndent = getBaseIndent(root.source.input.css);
					if (baseIndent && !getBaseIndent(source)) {
						source = source.replace(/^(?!\s*$)/mg, baseIndent);
						builder(source, root, 'end');
						return;
					}
				}
			}
			syntax.stringify(root, builder);
		});
		builder(document.raws.afterEnd, document, 'end');
	}
}

module.exports = stringify;
