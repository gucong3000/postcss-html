'use strict';

const expect = require('chai').expect;
const autoprefixer = require('autoprefixer');
const stylelint = require('stylelint');
const postcss = require('postcss');
const syntax = require('../');

describe('html tests', () => {
	it('autoprefixer', () => {
		return postcss([
			autoprefixer({
				browsers: ['Chrome >= 1'],
			}),
		]).process([
			'<html>',
			'<head>',
			'<style>',
			'a {',
			'\tdisplay: flex;',
			'}',
			'</style>',
			'</head>',
			'<body>',
			'</body>',
			'</html>',
		].join('\n'), {
			syntax,
			from: 'autoprefixer.html',
		}).then(result => {
			expect(result.content).to.equal([
				'<html>',
				'<head>',
				'<style>',
				'a {',
				'\tdisplay: -webkit-box;',
				'\tdisplay: -webkit-flex;',
				'\tdisplay: flex;',
				'}',
				'</style>',
				'</head>',
				'<body>',
				'</body>',
				'</html>',
			].join('\n'));
		});
	});
	it('stylelint', () => {
		return postcss([
			stylelint({
				config: {
					rules: {
						indentation: 2,
						'font-family-no-duplicate-names': true,
					},
				},
			}),
		]).process([
			'<html>',
			'<head>',
			'<style>',
			'a {',
			'\tdisplay: flex;',
			'}',
			'</style>',
			'</head>',
			'<body>',
			'<div style="font-family: serif, serif;">',
			'</div>',
			'</body>',
			'</html>',
		].join('\n'), {
			syntax,
			from: 'stylelint.html',
		}).then(result => {
			const errors = result.messages;
			expect(errors).to.have.lengthOf(2);
			expect(errors[0].rule).to.equal('indentation');
			expect(errors[0].line).to.equal(5);
			expect(errors[0].column).to.equal(2);
			expect(errors[1].rule).to.equal('font-family-no-duplicate-names');
			expect(errors[1].line).to.equal(10);
			expect(errors[1].column).to.equal(33);
		});
	});
	it('less', () => {
		const less = [
			'<html>',
			'<head>',
			'<style type="text/less">',
			'a {',
			'\tdisplay: flex;',
			'}',
			'</style>',
			'</head>',
			'<body>',
			'<div style="font-family: serif, serif;">',
			'</div>',
			'</body>',
			'</html>',
		].join('\n');
		return postcss([
			root => {
				expect(root.nodes).to.have.lengthOf(2);
			},
		]).process(less, {
			syntax: syntax({
				less: {
					parse: require('postcss-less').parse,
				},
			}),
			from: 'less.html',
		}).then(result => {
			expect(result.content).to.equal(less);
		});
	});
});
