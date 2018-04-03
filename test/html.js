"use strict";

const expect = require("chai").expect;
const autoprefixer = require("autoprefixer");
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
		]).process(less, {
			syntax: syntax(),
			from: "less.html",
		}).then(result => {
			expect(result.content).to.equal(less);
		});
	});

	it("javascript in html", () => {
		const code = [
			"<script>",
			"  function test() {",
			"    return `",
			"      <style>",
			"        .selector {",
			"          --property: value;",
			"        }",
			"      </style>",
			"    `;",
			"  }",
			"</script>",
			"",
		].join("\n");
		return postcss([
			root => {
				expect(root.nodes).to.have.lengthOf(1);
				expect(root.first.nodes).to.have.lengthOf(1);
				expect(root.first.first).to.have.property("selector", ".selector");
			},
		]).process(code, {
			syntax: syntax(),
			from: "html_in_js_in_html.html",
		}).then(result => {
			expect(result.content).to.equal(code);
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
		]).process(less, {
			syntax: syntax(),
			from: "less.html",
		}).then(result => {
			expect(result.content).to.equal(less);
		});
	});

	it("javascript module in html", () => {
		const code = [
			"<script type='module'>",
			"  function test() {",
			"    return `",
			"      <style>",
			"        .selector {",
			"          --property: value;",
			"        }",
			"      </style>",
			"    `;",
			"  }",
			"</script>",
			"",
		].join("\n");
		return postcss([
			root => {
				expect(root.nodes).to.have.lengthOf(1);
				expect(root.first.nodes).to.have.lengthOf(1);
				expect(root.first.first).to.have.property("selector", ".selector");
			},
		]).process(code, {
			syntax: syntax(),
			from: "html_in_js_in_html.html",
		}).then(result => {
			expect(result.content).to.equal(code);
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
			root => {
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

	it("stringify for nodes array", () => {
		const css = [
			"<html>",
			"<style>",
			"</style>",
			"</html>",
		].join("\n");
		return postcss([
			root => {
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

	it("<style> tag in last line", () => {
		const css = [
			"\n<style>b{}</style>",
		].join("\n");
		return postcss([
		]).process(css, {
			syntax: syntax,
			from: "push.html",
		}).then(result => {
			expect(result.root.nodes).to.be.lengthOf(1);
			expect(result.root.first.source.start.line).to.equal(2);
			expect(result.root.first.source.start.column).to.equal(8);
		});
	});
	it("react inline styles", () => {
		const css = `
			<div style={divStyle}/>
			<div style={{ height: '10%' }}/>
			<div style={{height: '10%'}}/>
			<div style={createMarkup()}/>
			<div style = {divStyle} />
			<div style = {{ height: '10%' }} />
			<div style = {{height: '10%'}} />
			<div style = {createMarkup()} />
		`;
		return postcss([
		]).process(css, {
			syntax: syntax,
			from: "react_inline_styles.html",
		}).then(result => {
			expect(result.root.nodes).to.be.lengthOf(0);
		});
	});
});
