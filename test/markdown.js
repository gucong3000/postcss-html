'use strict';

const expect = require('chai').expect;
const postcss = require('postcss');
const stylefmt = require('stylefmt');
const syntax = require('../');

describe('markdown tests', () => {
	const md = [
		'---',
		'title: Something Special',
		'---',
		'Here is some text.',
		'```css',
		'.foo {}',
		'```',
		'And some other text.',
		'```css',
		'    .foo { color: pink; }',
		'      .bar {}',
		'```',
		'<style>',
		'a {',
		'\tdisplay: flex;',
		'}',
		'</style>',
		'```scss',
		'// Parser-breaking comment',
		'$foo: bar;',
		'.foo {}',
		'```',
		'And the end.',
	].join('\n');

	it('CSS', function () {
		return postcss([
			root => {
				expect(root.nodes).to.have.lengthOf(4);
			},
		]).process(md, {
			syntax,
			from: 'lang.vue',
		}).then(result => {
			expect(result.content).to.equal(md);
		});
	});

	it('stylefmt', function () {
		const source = [
			'title: Something Special',
			'```css',
			'    .foo {',
			'    color: pink;',
			'    }',
			'      .bar {}',
			'```',
			'And the end.',
		].join('\n');
		const code = [
			'title: Something Special',
			'```css',
			'    .foo {',
			'    \tcolor: pink;',
			'    }',
			'',
			'    .bar {',
			'    }',
			'```',
			'And the end.',
		].join('\n');
		return postcss([
			stylefmt,
		]).process(source, {
			syntax,
			from: 'lang.vue',
		}).then(result => {
			expect(result.content).to.equal(code);
		});
	});
});
