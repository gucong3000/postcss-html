'use strict';

function stringify (document, builder) {
	if (document.source.syntax) {
		return document.source.syntax.stringify(document, builder);
	} else {
		document.nodes.forEach(root => {
			builder(root.raws.beforeStart, root, 'beforeStart');
			const stringify = root.source.syntax.stringify;
			if (root.source.isHTMLAttribute) {
				return stringify(root, string => {
					builder.apply(
						null,
						[
							string.replace(/[\r\n\t\s]+/g, ' '),
						].concat(
							Array.from(arguments).slice(1)
						)
					);
				});
			} else {
				stringify(root, builder);
			}
		});
		builder(document.raws.afterEnd, document, 'afterEnd');
	}
}

module.exports = stringify;
