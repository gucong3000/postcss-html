'use strict';

const cssSyntax = require('./css-syntax');

function defaultConfig (opts, lang) {
	let syntax;
	if (lang === 'scss' || lang === 'sass' || lang === 'less') {
		syntax = require('postcss-' + lang);
	} else if (lang === 'sugarss') {
		syntax = require('sugarss');
	} else {
		syntax = cssSyntax;
	}
	return syntax;
}

function getSyntax (opts, lang) {
	if (!lang) {
		lang = opts.from && /\.(\w+)(?:\?.+)?$/.exec(opts.from);
		lang = lang && lang[1].toLowerCase();
	}
	if (lang === 'sss') {
		lang = 'sugarss';
	}

	let config = opts.syntax.config;

	if (!config) {
		return defaultConfig(opts, lang);
	}

	if (typeof config === 'function') {
		config = config(opts, lang);
	}

	if (config) {
		config = config[lang || 'css'] || config;
		if (typeof config === 'string') {
			config = require(config);
		}
	} else {
		return defaultConfig(opts, lang);
	}

	return config;
}

module.exports = function (opts, lang) {
	return Object.assign({}, cssSyntax, getSyntax(opts, lang));
};
