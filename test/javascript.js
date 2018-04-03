"use strict";

const expect = require("chai").expect;
const postcss = require("postcss");
const syntax = require("../");
const fs = require("fs");

/* eslint-disable */
function testcase () {
	// `
	// 	<style>
	// 		.selector {
	// 		property: value;
	// 		}
	// 	</style>
	// `
	/*
	`
		<style>
			.selector {
			property: value;
			}
		</style>
	`
	*/
	"\""
	const html = `
		<style>
			.selector1 {
				property: value;
			}
		</style>
`;
	const CSS = `
	.selector2 {
		property: value;
	}
`;
}
/* eslint-enable */

describe("javascript tests", () => {
	it("html in template literal", () => {
		const code = fs.readFileSync(__filename, "utf8");
		return postcss([
			root => {
				expect(root.nodes).to.have.lengthOf(2);
				expect(root.first.nodes).to.have.lengthOf(1);
				expect(root.last.nodes).to.have.lengthOf(1);
				expect(root.first.first).to.have.property("selector", ".selector1");
				expect(root.last.first).to.have.property("selector", ".selector2");
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
			"  console.log(`debug`)",
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
		const code = "\\`";
		return postcss([
			root => {
				expect(root.nodes).to.have.lengthOf(0);
			},
		]).process(code, {
			syntax: syntax,
			from: "syntax_error.js",
		}).then(result => {
			expect(result.content).to.equal(code);
		});
	});
});
