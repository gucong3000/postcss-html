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
	if (document.stringify) {
		document.stringify(builder);
	} else {
		document.nodes.forEach(root => {
			builder(root.raws.beforeStart, root, 'start');
			let source = root.toString(root.syntax);
			const baseIndent = getBaseIndent(root.source.input.css);
			if (baseIndent && !getBaseIndent(source)) {
				source = source.replace(/^(?!\s*$)/mg, baseIndent);
			}
			builder(source, root, 'end');
		});
		builder(document.raws.afterEnd, document, 'end');
	}
}

module.exports = stringify;
