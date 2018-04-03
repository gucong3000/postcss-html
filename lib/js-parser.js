"use strict";

const requireParser = require("./require-parser");
const getSyntax = require("./get-syntax");
const htmlParser = requireParser("html");

function skip (attribute) {
	if (!attribute) {
		return;
	}
	if (attribute.lang) {
		return !/^(?:(?:java|type)script|m?[jt]sx?)$/i.test(attribute.lang);
	} else if (attribute.type) {
		return !/^(?:module|\w+\/(?:x-)?(?:java|type)script)$/i.test(attribute.type);
	}
}

module.exports = function (source, opts, attribute) {
	const styles = [];
	if (skip(attribute)) {
		return styles;
	}

	literal(source, (startIndex, endIndex, quote) => {
		if (quote !== "`") {
			return;
		}
		startIndex += quote.length;
		const strSource = source.slice(startIndex, endIndex - quote.length);
		if (!strSource.trim()) {
			return;
		}

		const styleHtm = htmlParser(strSource, opts);
		if (styleHtm) {
			styleHtm.forEach(style => {
				style.startIndex += startIndex;
				styles.push(style);
			});
		} else {
			const root = styleParse(strSource, opts);
			if (root) {
				styles.push({
					startIndex: startIndex,
					content: strSource,
					isStyled: true,
					root,
				});
			}
		}
	});

	return styles;
};

function styleParse (source, opts) {
	const syntax = getSyntax(opts);
	try {
		return syntax.parse(source, Object.assign({}, opts, {
			map: false,
		}));
	} catch (ex) {
		//
	}
}

function literal (source, callback) {
	let insideString = false;
	let insideComment = false;
	let insideSingleLineComment = false;
	let strStartIndex;
	let openingQuote;

	for (let i = 0, l = source.length; i < l; i++) {
		const currentChar = source[i];

		// Register the beginning of a comment
		if (
			!insideString && !insideComment &&
			currentChar === "/" &&
			source[i - 1] !== "\\" // escaping
		) {
			// standard comments
			if (source[i + 1] === "*") {
				insideComment = true;
				continue;
			}
			// single-line comments
			if (source[i + 1] === "/") {
				insideComment = true;
				insideSingleLineComment = true;
				continue;
			}
		}

		if (insideComment) {
			// Register the end of a standard comment
			if (
				!insideSingleLineComment &&
				currentChar === "*" &&
				source[i - 1] !== "\\" && // escaping
				source[i + 1] === "/" &&
				source[i - 1] !== "/" // don't end if it's /*/
			) {
				insideComment = false;
				continue;
			}

			// Register the end of a single-line comment
			if (
				insideSingleLineComment &&
				currentChar === "\n"
			) {
				insideComment = false;
				insideSingleLineComment = false;
				continue;
			}
		}

		// Register the beginning of a string
		if (!insideComment && !insideString && (currentChar === "\"" || currentChar === "'" || currentChar === "`")) {
			if (source[i - 1] === "\\") continue; // escaping

			openingQuote = currentChar;
			insideString = true;

			strStartIndex = i;
			continue;
		}

		if (insideString) {
			// Register the end of a string
			if (currentChar === openingQuote) {
				if (source[i - 1] === "\\") continue; // escaping
				insideString = false;
				callback(strStartIndex, i, openingQuote);
				continue;
			}
		}
	}
}
