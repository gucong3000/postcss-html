'use strict';

const expect = require('chai').expect;
// const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const syntax = require('../');
const sugarss = require('sugarss');

describe('SugarSS tests', () => {
	let sss = [
		'.one',
		'\tbackground: linear-gradient(rgba(0, 0, 0, 0), black)',
		'\t\tlinear-gradient(red, rgba(255, 0, 0, 0))',
	];
	const css = [
		sss[0] + ' {',
		sss[1],
		sss[2],
		'}',
	].join('\n');

	sss = sss.join('\n');

	it('SugarSS to CSS', () => {
		return postcss([
			root => {
				expect(root.nodes).to.have.lengthOf(1);
			},
		]).process(sss, {
			syntax: syntax({
				sugarss: {
					parse: sugarss.parse,
				},
			}),
			from: 'SugarSS.sss',
		}).then(result => {
			expect(result.content).to.equal(css);
		});
	});

	it('SugarSS to CSS', () => {
		return postcss([
			root => {
				expect(root.nodes).to.have.lengthOf(1);
			},
		]).process(sss, {
			syntax: syntax({
				parse: sugarss.parse,
			}),
		}).then(result => {
			expect(result.content).to.equal(css);
		});
	});

});
