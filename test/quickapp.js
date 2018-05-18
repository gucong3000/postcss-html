"use strict";

const expect = require("chai").expect;
const postcss = require("postcss");
const syntax = require("../");

describe("Quick App tests", () => {
	it("template value", () => {
		return postcss().process([
			"<template>",
			"\t<span style=\"color:{{notice.color}};font-size:{{notice.font_size}}px\" for=\"{{(index,notice) in showModalData.notice}}\">{{notice.txt}}</span>",
			"<style module=\"style\"></style>",
			"</template>",

		].join("\n"), {
			syntax,
			from: "quickapp.ux",
		}).then(result => {
			expect(result.root.nodes).to.have.lengthOf(2);
			expect(result.root.first.source).to.have.property("lang", "custom-template");
			expect(result.root.last.source).to.have.property("lang", "css");

			const root = result.root.first;
			expect(root.nodes).to.have.lengthOf(2);
			root.nodes.forEach(node => {
				expect(node).to.have.property("type", "decl");
			});

			// color:{{notice.color}}
			expect(root.first).to.have.property("prop", "color");
			expect(root.first).to.have.property("value", "{{notice.color}}");

			// font-size:{{notice.font_size}}px
			expect(root.last).to.have.property("prop", "font-size");
			expect(root.last).to.have.property("value", "{{notice.font_size}}px");
		});
	});
	it("template value", () => {
		return postcss().process([
			"<template>",
			"\t<span style=\"color:{{notice.color}};font-size:{{notice.font_size}}px\" for=\"{{(index,notice) in showModalData.notice}}\">{{notice.txt}}</span>",
			"</template>",

		].join("\n"), {
			syntax: syntax({
				css: "postcss-safe-parser",
			}),
			from: "quickapp.ux",
		}).then(result => {
			expect(result.root.nodes).to.have.lengthOf(1);
			const root = result.root.first;
			expect(root.nodes).to.have.lengthOf(2);
			root.nodes.forEach(node => {
				expect(node).to.have.property("type", "decl");
			});

			// color:{{notice.color}}
			expect(root.first).to.have.property("prop", "color");
			expect(root.first).to.have.property("value", "{{notice.color}}");

			// font-size:{{notice.font_size}}px
			expect(root.last).to.have.property("prop", "font-size");
			expect(root.last).to.have.property("value", "{{notice.font_size}}px");
		});
	});
});
