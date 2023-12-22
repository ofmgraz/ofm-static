<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="xs xsl tei" version="2.0">
    <xsl:output encoding="UTF-8" media-type="text/html" method="xhtml" version="1.0" indent="yes" omit-xml-declaration="yes"/>
    <xsl:template name="meta-tags">
        <xsl:param name="description"/>
        <xsl:param name="title"/>
        <meta charset="UTF-8"/>
        <meta name="description" content="{$description}"/>
        <meta name="keywords" content="{$title}"/>
    </xsl:template>
</xsl:stylesheet>
