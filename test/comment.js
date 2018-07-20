"use strict";

const expect = require("chai").expect;
const syntax = require("../");

describe("html tests", () => {
	it("style tag in disable block", () => {
		const html = [
			"<html>",
			"<!-- postcss-disable -->",
			"<style>",
			"a {",
			"\tdisplay: flex;",
			"}",
			"</style>",
			"<!-- postcss-enable -->",
			"<style>",
			"a {",
			"\tdisplay: flex;",
			"}",
			"</style>",
			"<!-- comment -->",
			"<!-- postcss-comment -->",
			"</html>",
		].join("\n");
		const document = syntax.parse(html);
		expect(document.nodes).to.have.lengthOf(1);
	});
	it("inline style in disable block", () => {
		const html = [
			"<html>",
			"<!-- postcss-disable -->",
			"<a style=\"color: red;\"></a>",
			"<!-- postcss-enable -->",
			"<a style=\"color: red;\"></a>",
			"<!-- comment -->",
			"</html>",
		].join("\n");
		const document = syntax.parse(html);
		expect(document.nodes).to.have.lengthOf(1);
	});
});
