"use strict";

const expect = require("chai").expect;
const postcss = require("postcss");
const syntax = require("../");

describe("javascript tests", () => {
	it("html in template literal", () => {
		const code = [
			"import * as postcss from 'postcss';",
			"function test() {",
			"  return `",
			"    <style>",
			"      .selector {",
			"        property: value;",
			"      }",
			"    </style>",
			"  `;",
			"}",
			"",
		].join("\n");
		return postcss([
			root => {
				expect(root.nodes).to.have.lengthOf(1);
				expect(root.first.nodes).to.have.lengthOf(1);
				expect(root.first.first).to.have.property("selector", ".selector");
			},
		]).process(code, {
			syntax: syntax,
			from: "html_template_literal.mjs",
		}).then(result => {
			expect(result.content).to.equal(code);
		});
	});

	it("empty template literal", () => {
		const code = [
			"function test() {",
			"  return ``;",
			"}",
			"",
		].join("\n");
		return postcss([
			root => {
				expect(root.nodes).to.have.lengthOf(0);
			},
		]).process(code, {
			syntax: syntax,
			from: "empty_template_literal.js",
		}).then(result => {
			expect(result.content).to.equal(code);
		});
	});

	it("skip javascript syntax error", () => {
		const jsParser = require("../lib/js-parser");
		expect(jsParser("(", {
			from: "syntax_error.js",
		})).to.have.lengthOf(0);
	});
});
