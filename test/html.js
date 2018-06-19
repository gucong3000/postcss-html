"use strict";

const expect = require("chai").expect;
const postcss = require("postcss");
const syntax = require("../");

describe("html tests", () => {
	it("Invalid HTML", () => {
		const html = "<";
		const document = syntax.parse(html, {
			from: "invalid.html",
		});
		expect(document.source).to.haveOwnProperty("lang", "html");
		expect(document.nodes).to.have.lengthOf(0);
		expect(document.toString()).equal(html);
	});

	it("less", () => {
		const html = [
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
		const document = syntax.parse(html, {
			from: "less.html",
		});
		expect(document.source).to.haveOwnProperty("lang", "html");
		expect(document.nodes).to.have.lengthOf(2);
		expect(document.toString()).equal(html);
	});

	it("stringify for append node", () => {
		const html = [
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
		]).process(html, {
			syntax: syntax,
			from: "append.html",
		}).then(result => {
			expect(result.root.source).to.haveOwnProperty("lang", "html");
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
		const html = [
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
		]).process(html, {
			syntax: syntax,
			from: "prepend.html",
		}).then(result => {
			expect(result.root.source).to.haveOwnProperty("lang", "html");
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
		const html = [
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
		]).process(html, {
			syntax: syntax,
			from: "insertBefore.html",
		}).then(result => {
			expect(result.root.source).to.haveOwnProperty("lang", "html");
			expect(result.content).to.equal([
				"<html>",
				"<style>",
				"b {}",
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
		const html = [
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
		]).process(html, {
			syntax: syntax,
			from: "insertAfter.html",
		}).then(result => {
			expect(result.root.source).to.haveOwnProperty("lang", "html");
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
				"b {}",
				"</style>",
				"</html>",
			].join("\n"));
		});
	});

	it("stringify for unshift node", () => {
		const html = [
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
		]).process(html, {
			syntax: syntax,
			from: "unshift.html",
		}).then(result => {
			expect(result.root.source).to.haveOwnProperty("lang", "html");
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
		const html = [
			"<html>",
			"<style>",
			"a {",
			"\tdisplay: flex;",
			"}",
			"</style>",
			"</html>",
		].join("\n");

		return postcss([
			root => {
				root.nodes.push(postcss.parse("b {}"));
			},
		]).process(html, {
			syntax: syntax,
			from: "push.html",
		}).then(result => {
			expect(result.root.source).to.haveOwnProperty("lang", "html");
			expect(result.content).to.equal([
				"<html>",
				"<style>",
				"a {",
				"\tdisplay: flex;",
				"}b {}",
				"</style>",
				"</html>",
			].join("\n"));
		});
	});

	it("stringify for nodes array", () => {
		const html = [
			"<html>",
			"<style>",
			"</style>",
			"</html>",
		].join("\n");
		return postcss([
			root => {
				root.nodes = [postcss.parse("b {}")];
			},
		]).process(html, {
			syntax: syntax,
			from: "push.html",
		}).then(result => {
			expect(result.root.source).to.haveOwnProperty("lang", "html");
			expect(result.content).to.equal([
				"<html>",
				"<style>",
				"b {}</style>",
				"</html>",
			].join("\n"));
		});
	});

	it("<style> tag in last line", () => {
		const html = "\n<style>b{}</style>";
		const document = syntax.parse(html, {
			from: "style_tag_in_last_line.html",
		});
		expect(document.source).to.haveOwnProperty("lang", "html");
		expect(document.nodes).to.be.lengthOf(1);
		expect(document.toString()).equal(html);
		expect(document.first.source.start.line).to.equal(2);
		expect(document.first.source.start.column).to.equal(8);
	});

	it("react inline styles", () => {
		const html = `
			<div style={divStyle}/>
			<div style={{ height: '10%' }}/>
			<div style={{height: '10%'}}/>
			<div style={createMarkup()}/>
			<div style = {divStyle} />
			<div style = {{ height: '10%' }} />
			<div style = {{height: '10%'}} />
			<div style = {createMarkup()} />
		`;
		const document = syntax.parse(html, {
			from: "react_inline_styles.html",
		});
		expect(document.source).to.haveOwnProperty("lang", "html");
		expect(document.nodes).to.be.lengthOf(0);
		expect(document.toString()).equal(html);
	});
});
