'use strict';

const stringify = require('postcss/lib/stringify');
const parse  = require('postcss/lib/parse');

const cssSyntax = {
	stringify,
	parse,
};

module.exports = cssSyntax;
