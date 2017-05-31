'use strict';

function stringify (document, builder) {
	if (document.stringify) {
		document.stringify(builder);
	} else {
		document.nodes.forEach(root => {
			builder(root.raws.beforeStart, root, 'start');
			root.stringify(builder);
		});
		builder(document.raws.afterEnd, document, 'end');
	}
}

module.exports = stringify;
