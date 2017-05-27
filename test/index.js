'use strict';

const cases = require('postcss-parser-tests');
const expect = require('chai').expect;
const autoprefixer = require('autoprefixer');
const stylelint = require('stylelint');
const postcss = require('postcss');
const syntax = require('../');

describe('postcss-parser-tests', () => {
	cases.each( (name, css, ideal) => {
		it('parses ' + name, () => {
			const root = syntax.parse(css, {
				from: name,
			});
			const json = cases.jsonify(root);
			expect(json).to.eql(ideal);
		});
	});
});

describe('API', () => {
	const html = [
		'<style type="text/less">',
		'@c: #888;',
		'.variables {color: @c;}',
		'</style>',
		'<style lang="sugarss">',
		'a',
		'  color: blue',
		'</style>',
		'<style>',
		'a {}',
		'</style>',
	].join('\n');

	it('config callback', () => {
		const args = [];
		return postcss([

		]).process(html,	{
			syntax: syntax((options, lang) => {
				args.push(lang);
				if (!lang || lang === 'css') {
					return postcss;
				}
			}),
			from: 'api.vue',
		}).then(result => {
			expect(result.root.nodes).to.have.lengthOf(3);
			expect(args[0]).to.equal('less');
			expect(args[1]).to.equal('sugarss');
			expect(args[2]).to.equal('css');
		});
	});

	it('config map object', () => {
		return postcss([

		]).process(html,	{
			syntax: syntax({
				css: postcss,
				sugarss: 'sugarss',
				less: 'postcss-less',
			}),
			from: 'api.vue',
		}).then(result => {
			expect(result.root.nodes).to.have.lengthOf(3);
		});
	});

	it('single line syntax error', () => {
		expect(() => [
			syntax.parse('<style>a {</style>', {
				from: 'SyntaxError.vue',
			}),
		]).to.throw(/SyntaxError.vue:1:8: Unclosed block\b/);
	});

	it('single line with line ending syntax error', () => {
		expect(() => [
			syntax.parse('<style>a {</style>\n', {
				from: 'SyntaxError.vue',
			}),
		]).to.throw(/SyntaxError.vue:1:8: Unclosed block\b/);
	});

	it('multi line syntax error', () => {
		expect(() => [
			syntax.parse([
				'<html>',
				'<style>a {</style>',
				'</html>',
			].join('\n'), {
				from: 'SyntaxError.vue',
			}),
		]).to.throw(/SyntaxError.vue:2:8: Unclosed block\b/);
	});

	it('custom parse error', () => {
		expect(() => [
			syntax({
				parse: function () {
					throw new TypeError('custom parse error');
				},
			}).parse([
				'<html>',
				'<style>a {</style>',
				'</html>',
			].join('\n'), {
				from: 'SyntaxError.vue',
			}),
		]).to.throw('custom parse error');
	});
});

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
});

describe('vue tests', () => {
	it('stylelint', () => {
		return postcss([
			autoprefixer({
				browsers: ['Chrome >= 1'],
				cascade: false,
			}),
		]).process([
			'<style module="style">',
			'.red {',
			'  color: red;',
			'}',
			'@keyframes fade {',
			'  from { opacity: 1; } to { opacity: 0; }',
			'}',
			'.animate {',
			'  animation: fade 1s;',
			'}',
			'</style>',
			'<style scoped lang="stylus" module>',
			'.red',
			'  color: red',
			'</style>',
			'<script>',
			'module.exports = {}',
			'</script>',
		].join('\n'), {
			syntax,
			from: 'autoprefixer.vue',
		}).then(result => {
			expect(result.content).to.equal([
				'<style module="style">',
				'.red {',
				'  color: red;',
				'}',
				'@-webkit-keyframes fade {',
				'  from { opacity: 1; } to { opacity: 0; }',
				'}',
				'@keyframes fade {',
				'  from { opacity: 1; } to { opacity: 0; }',
				'}',
				'.animate {',
				'  -webkit-animation: fade 1s;',
				'  animation: fade 1s;',
				'}',
				'</style>',
				'<style scoped lang="stylus" module>',
				'.red',
				'  color: red',
				'</style>',
				'<script>',
				'module.exports = {}',
				'</script>',
			].join('\n'));
		});
	});
	it('vue with empty <style>', () => {
		return postcss([
		]).process([
			'<style module="style"></style>',
			'<style scoped lang="stylus" module>',
			'</style>',
		].join('\n'), {
			syntax,
			from: 'empty.vue',
		}).then(result => {
			expect(result.root.nodes).to.have.lengthOf(0);
		});
	});
	it('vue with lang(s)', () => {
		const vue = [
			'<style lang="scss?outputStyle=expanded">',
			'//sass style',
			'//-----------------------------------',
			'$fontStack:    Helvetica, sans-serif;',
			'$primaryColor: #333;',

			'body {',
			'  font-family: $fontStack;',
			'  color: $primaryColor;',
			'}',
			'</style>',
			'<style lang="less">',
			'@base: #f938ab;',

			'.box-shadow(@style, @c) when (iscolor(@c)) {',
			'  -webkit-box-shadow: @style @c;',
			'  box-shadow:         @style @c;',
			'}',
			'.box-shadow(@style, @alpha: 50%) when (isnumber(@alpha)) {',
			'  .box-shadow(@style, rgba(0, 0, 0, @alpha));',
			'}',
			'.box {',
			'  color: saturate(@base, 5%);',
			'  border-color: lighten(@base, 30%);',
			'  div { .box-shadow(0 0 5px, 30%) }',
			'}',
			'</style>',
		].join('\n');
		return postcss([
			root => {
				expect(root.nodes).to.have.lengthOf(2);
			},
		]).process(vue, {
			syntax,
			from: 'lang.vue',
		}).then(result => {
			expect(result.content).to.equal(vue);
		});
	});
});
