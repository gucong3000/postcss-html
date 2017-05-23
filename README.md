PostCSS HTML Syntax
====

[![NPM version](https://img.shields.io/npm/v/postcss-html.svg?style=flat-square)](https://www.npmjs.com/package/postcss-html)
[![Travis](https://img.shields.io/travis/gucong3000/postcss-html.svg)](https://travis-ci.org/gucong3000/postcss-html)
[![Coverage Status](https://img.shields.io/coveralls/gucong3000/postcss-html.svg)](https://coveralls.io/r/gucong3000/postcss-html)

<img align="right" width="95" height="95"
     title="Philosopher’s stone, logo of PostCSS"
     src="http://postcss.github.io/postcss/logo.svg">

[PostCSS](https://github.com/postcss/postcss) Syntax for parsing HTML

## Getting Started

First thing's first, install the module:

```
npm install postcss-html --save-dev
```

If you want support SCSS/SASS/LESS/SugarSS syntax in HTML, you need to install the corresponding module.

- SCSS: [PostCSS-SCSS](https://github.com/postcss/postcss-scss)
- SASS: [PostCSS-SASS](https://github.com/aleshaoleg/postcss-sass)
- LESS: [PostCSS-LESS](https://github.com/shellscape/postcss-less)
- SugarSS: [SugarSS](https://github.com/postcss/sugarss)

## Use Cases

### Style Transformations

The main use case of this plugin is to apply PostCSS transformations directly to HTML source code. For example, if you ship a theme written in style tag in HTML and need [Autoprefixer](https://github.com/postcss/autoprefixer) to add the appropriate vendor prefixes to it; or you need to lint style source in HTML with a plugin such as [Stylelint](http://stylelint.io/).

```js
var syntax = require('postcss-html');
postcss(plugins).process(html, { syntax: syntax }).then(function (result) {
    result.content // HTML with transformations
});
```

### custom Syntax for styles

#### Using map object configuration

```js
var syntax = require('postcss-html');
postcss(plugins).process(html, {
	syntax: syntax({
		css: require('postcss'),
		less: require('postcss-less'),
		scss: require('postcss-scss'),
	})
}).then(function (result) {
    result.content // HTML with transformations
});
```

#### Using callback function configuration

```js
var syntax = require('postcss-html');
postcss(plugins).process(html, {
	syntax: syntax((opts, lang) => {
		if (lang) {
			// `lang`: language of style tag in html.
			// style tag in HTML file
			if (lang === 'less') {
				// `<style type="text/less">`
				return require('postcss-scss')
			}
		} else if(opts.from) {
			// `opts`: See http://api.postcss.org/global.html#processOptions
			if (/\.less$/.test(opts.from)) {
				// `*.less` file
				return require('postcss-less')
			}
		}
	})
}).then(function (result) {
    result.content // HTML with transformations
});
```
