"use strict";
const split = require("./split");
const syntax = require("postcss-syntax/lib/syntax")(split);

module.exports = syntax;
