'use strict';

const cssSyntax = require('./css-syntax');

function defaultConfig (opts, lang) {
	let syntax;
	if (lang === 'scss' || lang === 'sass' || lang === 'less') {
		syntax = require('postcss-' + lang);
	} else if (lang === 'sugarss' || lang === 'sss') {
		syntax = require('sugarss');
	} else {
		syntax = cssSyntax;
	}
	return syntax;
}

function getSyntax (opts, lang) {
	if (lang) {
		lang = lang.toLowerCase();
	} else {
		lang = /\.(\w+)(?:\?.+)?$/.exec(opts.from);
		lang = lang && lang[1].toLowerCase();
	}

	let config = opts.syntax.config;

	if (!config) {
		return defaultConfig(opts, lang);
	}

	if (typeof config === 'function') {
		config = config(opts, lang);
	}

	if (config) {
		config = config[lang] || config;
	} else {
		return defaultConfig(opts, lang);
	}

	return Object.assign({}, cssSyntax, config);
}

module.exports = getSyntax;
