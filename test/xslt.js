"use strict";

const expect = require("chai").expect;
const postcss = require("postcss");
const syntax = require("../");

describe("XSLT tests", () => {
	// https://msdn.microsoft.com/en-us/library/ms764661(v=vs.85).aspx
	it("Incorporating <STYLE> Elements into an XSLT File", () => {
		const xml = `
<?xml version='1.0'?>
<xsl:stylesheet version="1.0"
		xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
<STYLE>
H1 {
	font-family: Arial,Univers,sans-serif;
	font-size: 36pt
}
</STYLE>
</xsl:template>

<xsl:template match="name">
	<TD STYLE="font-size:14pt; font-family:serif">
	<xsl:apply-templates />
	</TD>
</xsl:template>
</xsl:stylesheet>
		`;
		return postcss([
		]).process(xml, {
			syntax: syntax,
			from: "XSLT.xsl",
		}).then(result => {
			expect(result.root.nodes).to.be.lengthOf(2);
			expect(result.root.first.nodes).to.be.lengthOf(1);
			expect(result.root.last.nodes).to.be.lengthOf(2);
		});
	});
});
