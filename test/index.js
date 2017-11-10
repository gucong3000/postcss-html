"use strict";

const cases = require("postcss-parser-tests");
const expect = require("chai").expect;
const postcss = require("postcss");
const syntax = require("../");
const stripBom = require("strip-bom");

describe("postcss-parser-tests", () => {
	cases.each((name, css, ideal) => {
		it("stringify " + name, () => {
			return postcss([

			]).process(css,	{
				syntax: syntax,
				from: name,
			}).then(result => {
				// delete result.root.source.syntax;
				const json = cases.jsonify(result.root);
				expect(json).to.equal(ideal);
				expect(result.content).to.equal(stripBom(css));
			});
		});
	});
});

describe("API", () => {
	const html = [
		"<style type=\"text/less\">",
		"@c: #888;",
		".variables {color: @c;}",
		"</style>",
		"<style lang=\"sugarss\">",
		"a",
		"  color: blue",
		"</style>",
		"<style>",
		"a {}",
		"</style>",
	].join("\n");

	it("config callback", () => {
		const args = [];
		return postcss([

		]).process(html,	{
			syntax: syntax((options, lang) => {
				args.push(lang);
				if (!lang || lang === "css") {
					return postcss;
				}
			}),
			from: "api.vue",
		}).then(result => {
			expect(result.root.nodes).to.have.lengthOf(3);
			expect(args[0]).to.equal("less");
			expect(args[1]).to.equal("sugarss");
			expect(args[2]).to.equal("css");
		});
	});

	it("config map object", () => {
		return postcss([

		]).process(html, {
			syntax: syntax({
				css: postcss,
				sugarss: "sugarss",
				less: "postcss-less",
			}),
			from: "api.vue",
		}).then(result => {
			expect(result.root.nodes).to.have.lengthOf(3);
		});
	});

	it("single line syntax error", () => {
		expect(() => {
			syntax.parse("<style>a {</style>", {
				from: "SyntaxError.vue",
			});
		}).to.throw(/SyntaxError.vue:1:8: Unclosed block\b/);
	});

	it("single line with line ending syntax error", () => {
		expect(() => {
			syntax.parse("<style>a {</style>\n", {
				from: "SyntaxError.vue",
			});
		}).to.throw(/SyntaxError.vue:1:8: Unclosed block\b/);
	});

	it("multi line syntax error", () => {
		expect(() => {
			syntax.parse([
				"<html>",
				"<style>a {</style>",
				"</html>",
			].join("\n"), {
				from: "SyntaxError.html",
			});
		}).to.throw(/SyntaxError.html:2:8: Unclosed block\b/);
	});

	it("custom parse error", () => {
		expect(() => {
			syntax({
				parse: function () {
					throw new TypeError("custom parse error");
				},
			}).parse([
				"<html>",
				"<style>a {}</style>",
				"</html>",
			].join("\n"), {
				from: "CustomError.html",
			});
		}).to.throw("custom parse error");
	});
});
