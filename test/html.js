"use strict";

const expect = require("chai").expect;
const autoprefixer = require("autoprefixer");
const stylelint = require("stylelint");
const stylefmt = require("stylefmt");
const postcss = require("postcss");
const syntax = require("../");

describe("html tests", () => {
	it("Invalid HTML", () => {
		return postcss().process("<", {
			syntax: syntax,
			from: "invalid.html",
		}).then(result => {
			expect(result.content).to.equal("<");
		});
	});
	it("autoprefixer", () => {
		return postcss([
			autoprefixer({
				browsers: ["Chrome >= 1"],
			}),
		]).process([
			"<html>",
			"<head>",
			"<style>",
			"a {",
			"\tdisplay: flex;",
			"}",
			"</style>",
			"</head>",
			"<body>",
			"</body>",
			"</html>",
		].join("\n"), {
			syntax,
			from: "autoprefixer.html",
		}).then(result => {
			expect(result.content).to.equal([
				"<html>",
				"<head>",
				"<style>",
				"a {",
				"\tdisplay: -webkit-box;",
				"\tdisplay: -webkit-flex;",
				"\tdisplay: flex;",
				"}",
				"</style>",
				"</head>",
				"<body>",
				"</body>",
				"</html>",
			].join("\n"));
		});
	});
	it("stylelint", () => {
		return postcss([
			stylelint({
				config: {
					rules: {
						indentation: 2,
						"font-family-no-duplicate-names": true,
					},
				},
			}),
		]).process([
			"<html>",
			"<head>",
			"<style>",
			"a {",
			"\tdisplay: flex;",
			"}",
			"</style>",
			"</head>",
			"<body>",
			"<div style=\"font-family: serif, serif;\">",
			"</div>",
			"</body>",
			"</html>",
		].join("\n"), {
			syntax,
			from: "stylelint.html",
		}).then(result => {
			const errors = result.messages;
			expect(errors).to.have.lengthOf(2);
			expect(errors[0].rule).to.equal("indentation");
			expect(errors[0].line).to.equal(5);
			expect(errors[0].column).to.equal(2);
			expect(errors[1].rule).to.equal("font-family-no-duplicate-names");
			expect(errors[1].line).to.equal(10);
			expect(errors[1].column).to.equal(33);
		});
	});
	it("less", () => {
		const less = [
			"<html>",
			"<head>",
			"<style type=\"text/less\">",
			"a {",
			"\tdisplay: flex;",
			"}",
			"</style>",
			"</head>",
			"<body>",
			"<div style=\"font-family: serif, serif;\">",
			"</div>",
			"</body>",
			"</html>",
		].join("\n");
		return postcss([
			root => {
				expect(root.nodes).to.have.lengthOf(2);
				expect(root.toString()).equal(less);
			},
			stylefmt,
		]).process(less, {
			syntax: syntax(),
			from: "less.html",
		}).then(result => {
			expect(result.content).to.equal(less);
		});
	});

	it("fix css", () => {
		const css = [
			"<html>",
			"<style>",
			"a {",
			"\tdisplay: flex;",
			"</html>",
		].join("\n");
		return postcss([
			function (root) {
				root.last.raws.after = root.last.raws.after.replace(/[\r\n]*$/, "\n");
			},
		]).process(css, {
			syntax: syntax,
			fix: true,
			from: "autofix.html",
		}).then(result => {
			expect(result.content).to.equal([
				"<html>",
				"<style>",
				"a {",
				"\tdisplay: flex;",
				"}",
				"</html>",
			].join("\n"));
		});
	});

	it("stringify for append node", () => {
		const css = [
			"<html>",
			"<style>",
			"a {",
			"\tdisplay: flex;",
			"}",
			"</style>",
			"</html>",
		].join("\n");
		return postcss([
			function (root) {
				root.append({
					selector: "b",
				});
			},
		]).process(css, {
			syntax: syntax,
			from: "inserted.html",
		}).then(result => {
			expect(result.content).to.equal([
				"<html>",
				"<style>",
				"a {",
				"\tdisplay: flex;",
				"}",
				"b {}",
				"</style>",
				"</html>",
			].join("\n"));
		});
	});

	it("stringify for prepend node", () => {
		const css = [
			"<html>",
			"<style>",
			"a {",
			"\tdisplay: flex;",
			"}",
			"</style>",
			"</html>",
		].join("\n");
		return postcss([
			function (root) {
				root.prepend({
					selector: "b",
				});
			},
		]).process(css, {
			syntax: syntax,
			from: "prepend.html",
		}).then(result => {
			expect(result.content).to.equal([
				"<html>",
				"<style>",
				"b {}",
				"a {",
				"\tdisplay: flex;",
				"}",
				"</style>",
				"</html>",
			].join("\n"));
		});
	});

	it("stringify for insertBefore node", () => {
		const css = [
			"<html>",
			"<style>",
			"a {",
			"\tdisplay: flex;",
			"}",
			"</style>",
			"<style>",
			"a {",
			"\tdisplay: flex;",
			"}",
			"</style>",
			"</html>",
		].join("\n");
		return postcss([
			function (root) {
				root.insertBefore(root.last, {
					selector: "b",
				});
			},
		]).process(css, {
			syntax: syntax,
			from: "insertBefore.html",
		}).then(result => {
			expect(result.content).to.equal([
				"<html>",
				"<style>",
				"a {",
				"\tdisplay: flex;",
				"}",
				"</style>",
				"<style>",
				"b {}",
				"a {",
				"\tdisplay: flex;",
				"}",
				"</style>",
				"</html>",
			].join("\n"));
		});
	});

	it("stringify for insertAfter node", () => {
		const css = [
			"<html>",
			"<style>",
			"a {",
			"\tdisplay: flex;",
			"}",
			"</style>",
			"<style>",
			"a {",
			"\tdisplay: flex;",
			"}",
			"</style>",
			"</html>",
		].join("\n");
		return postcss([
			function (root) {
				root.insertAfter(root.first, {
					selector: "b",
				});
			},
		]).process(css, {
			syntax: syntax,
			from: "insertAfter.html",
		}).then(result => {
			expect(result.content).to.equal([
				"<html>",
				"<style>",
				"a {",
				"\tdisplay: flex;",
				"}",
				"b {}",
				"</style>",
				"<style>",
				"a {",
				"\tdisplay: flex;",
				"}",
				"</style>",
				"</html>",
			].join("\n"));
		});
	});

	it("stringify for unshift node", () => {
		const css = [
			"<html>",
			"<style>",
			"a {",
			"\tdisplay: flex;",
			"}",
			"</style>",
			"</html>",
		].join("\n");
		return postcss([
			function (root) {
				root.nodes.unshift(postcss.parse("b {}"));
			},
		]).process(css, {
			syntax: syntax,
			from: "unshift.html",
		}).then(result => {
			expect(result.content).to.equal([
				"<html>",
				"<style>",
				"b {}a {",
				"\tdisplay: flex;",
				"}",
				"</style>",
				"</html>",
			].join("\n"));
		});
	});

	it("stringify for push node", () => {
		const css = [
			"<html>",
			"<style>",
			"a {",
			"\tdisplay: flex;",
			"}",
			"</style>",
			"</html>",
		].join("\n");
		return postcss([
			function (root) {
				root.nodes.push(postcss.parse("b {}"));
			},
		]).process(css, {
			syntax: syntax,
			from: "push.html",
		}).then(result => {
			expect(result.content).to.equal([
				"<html>",
				"<style>",
				"a {",
				"\tdisplay: flex;",
				"}",
				"b {}</style>",
				"</html>",
			].join("\n"));
		});
	});

	it("stringify for node aray", () => {
		const css = [
			"<html>",
			"<style>",
			"</style>",
			"</html>",
		].join("\n");
		return postcss([
			function (root) {
				root.nodes = [postcss.parse("b {}")];
			},
		]).process(css, {
			syntax: syntax,
			from: "push.html",
		}).then(result => {
			/* eslint-disable no-unused-expressions */
			expect(result.content).to.be.ok;
		});
	});
});
