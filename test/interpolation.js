"use strict";

const expect = require("chai").expect;
const syntax = require("../");

describe("template interpolation", () => {
	it("PHP", () => {
		const document = syntax.parse(
			[
				"<a style=\"color: #<?php echo '000' ?>;font-size:<?php echo '12' ?>px\">",
				"</a>",
			].join("\n"), {
				from: "quickapp.ux",
			}
		);

		expect(document.nodes).to.have.lengthOf(1);

		const root = document.first;
		expect(root.source).to.have.property("lang", "css");
		expect(root.nodes).to.have.lengthOf(2);
		expect(root.first).to.have.property("type", "decl");
		expect(root.first).to.have.property("prop", "color");
		expect(root.first).to.have.property("value", "#<?php echo '000' ?>");
		expect(root.last).to.have.property("type", "decl");
		expect(root.last).to.have.property("prop", "font-size");
		expect(root.last).to.have.property("value", "<?php echo '12' ?>px");
	});

	it("EJS", () => {
		const document = syntax.parse(
			[
				"<a style=\"color: #<%= user.color %>;font-size:<%= user.size %>px\">",
				"</a>",
			].join("\n"), {
				from: "quickapp.ux",
			}
		);

		expect(document.nodes).to.have.lengthOf(1);

		const root = document.first;
		expect(root.source).to.have.property("lang", "css");
		expect(root.nodes).to.have.lengthOf(2);
		expect(root.first).to.have.property("type", "decl");
		expect(root.first).to.have.property("prop", "color");
		expect(root.first).to.have.property("value", "#<%= user.color %>");
		expect(root.last).to.have.property("type", "decl");
		expect(root.last).to.have.property("prop", "font-size");
		expect(root.last).to.have.property("value", "<%= user.size %>px");
	});

	it("Quick App", () => {
		const document = syntax.parse(
			[
				"<template>",
				"\t<span style=\"color:#{{notice.color}};font-size:{{notice.font_size}}px\" for=\"{{(index,notice) in showModalData.notice}}\">{{notice.txt}}</span>",
				"<style module=\"style\"></style>",
				"</template>",
			].join("\n"), {
				from: "quickapp.ux",
			}
		);

		expect(document.nodes).to.have.lengthOf(2);
		expect(document.first.source).to.have.property("lang", "custom-template");
		expect(document.last.source).to.have.property("lang", "css");

		const root = document.first;
		expect(root.nodes).to.have.lengthOf(2);
		root.nodes.forEach(node => {
			expect(node).to.have.property("type", "decl");
		});

		expect(root.first).to.have.property("prop", "color");
		expect(root.first).to.have.property("value", "#{{notice.color}}");

		expect(root.last).to.have.property("prop", "font-size");
		expect(root.last).to.have.property("value", "{{notice.font_size}}px");
	});

	it("VUE", () => {
		const document = syntax.parse(
			[
				"<template>",
				"\t<span style=\"color:#{{notice.color}};font-size:{{notice.font_size}}px\" for=\"{{(index,notice) in showModalData.notice}}\">{{notice.txt}}</span>",
				"<style module=\"style\"></style>",
				"</template>",
			].join("\n"), {
				from: "vue-sfc.vue",
			}
		);

		expect(document.nodes).to.have.lengthOf(2);
		expect(document.first.source).to.have.property("lang", "custom-template");
		expect(document.last.source).to.have.property("lang", "css");

		const root = document.first;
		expect(root.nodes).to.have.lengthOf(2);
		root.nodes.forEach(node => {
			expect(node).to.have.property("type", "decl");
		});

		expect(root.first).to.have.property("prop", "color");
		expect(root.first).to.have.property("value", "#{{notice.color}}");

		expect(root.last).to.have.property("prop", "font-size");
		expect(root.last).to.have.property("value", "{{notice.font_size}}px");
	});

	it("Svelte", () => {
		const document = syntax.parse(
			[
				"<a style=\"display: {dynamicProperties}\">",
				"</a>",
			].join("\n"), {
				from: "quickapp.ux",
			}
		);
		expect(document.nodes).to.have.lengthOf(1);
		expect(document.first.source).to.have.property("lang", "custom-template");
		const root = document.first;
		expect(root.nodes).to.have.lengthOf(1);
		root.nodes.forEach(node => {
			expect(node).to.have.property("type", "decl");
		});
		expect(root.first).to.have.property("prop", "display");
		expect(root.first).to.have.property("value", "{dynamicProperties}");
	});
});
