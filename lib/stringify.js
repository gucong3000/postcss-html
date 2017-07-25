'use strict';

function stringify (document, builder) {
	if (document.source.syntax) {
		return document.source.syntax.stringify(document, builder);
	} else {
		document.nodes.forEach(root => {
			builder(root.raws.beforeStart, root, 'beforeStart');
			const {
				isHTMLAttribute,
				syntax,
			} = root.source;

			if (isHTMLAttribute) {
				return syntax.stringify(root, (string, ...args) => {
					builder(string.replace(/[\r\n\t\s]+/g, ' '), ...args);
				});
			} else {
				syntax.stringify(root, builder);
			}
		});
		builder(document.raws.afterEnd, document, 'afterEnd');
	}
}

module.exports = stringify;
