'use strict';

function stringify (document, builder) {
	if (document.stringify) {
		document.stringify(document, builder);
	} else {
		document.nodes.forEach(root => {
			builder(root.raws.beforeStart, root, 'start');
			builder(root.toString(), root, 'end');
		});
		builder(document.raws.afterEnd, document, 'end');
	}
}

module.exports = stringify;
