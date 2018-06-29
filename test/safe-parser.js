"use strict";

const expect = require("chai").expect;
const syntax = require("../");

describe("postcss-safe-parser", () => {
	it("Quick App", () => {
		const document = syntax({
			css: "postcss-safe-parser",
		}).parse(
			[
				"<template>",
				"\t<span style=\"color:{{notice.color}};font-size:{{notice.font_size}}px\" for=\"{{(index,notice) in showModalData.notice}}\">{{notice.txt}}</span>",
				"</template>",
			].join("\n"), {
				from: "quickapp.ux",
			}
		);

		expect(document.nodes).to.have.lengthOf(1);
		const root = document.first;
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
