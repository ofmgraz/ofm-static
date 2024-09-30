<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    version="2.0" exclude-result-prefixes="xsl tei xs">

    <xsl:output encoding="UTF-8" media-type="text/html" method="html" version="5.0" indent="yes"
        omit-xml-declaration="yes"/>


    <xsl:import href="./partials/html_navbar.xsl"/>
    <xsl:import href="./partials/html_head.xsl"/>
    <xsl:import href="./partials/html_footer.xsl"/>
    <xsl:import href="./partials/person.xsl"/>
    <xsl:variable name="lang" select="'de'"/>


    <xsl:template match="/">
        <xsl:variable name="doc_title">
            <xsl:value-of select=".//tei:titleStmt/tei:title[@xml:lang = $lang]/text()"/>
        </xsl:variable>
        <html class="page">

            <head>
                <xsl:call-template name="html_head">
                    <xsl:with-param name="html_title" select="$doc_title"/>
                </xsl:call-template>
            </head>

            <body class="d-flex flex-column">
                <xsl:call-template name="nav_bar"/>

                <main class="flex-grow-1">
                    <div class="container text-align-center">
                        <h2 class="text-center">
                            <xsl:value-of select="$doc_title"/>
                        </h2>

                        <div class="col-md-6 col-10 drucker center">
                            <ul class="list">
                                <xsl:for-each select=".//tei:person[@xml:id]">
                                    <xsl:variable name="id">
                                        <xsl:value-of select="data(@xml:id)"/>
                                    </xsl:variable>
                                    <li>
                                        <a>
                                            <xsl:attribute name="href">
                                                  <xsl:value-of select="concat($id, '.html')"/>
                                            </xsl:attribute>
                                            <xsl:value-of select=".//tei:forename/text()"/>
                                            <xsl:text> </xsl:text>
                                            <xsl:value-of select=".//tei:surname/text()"/>
                                        </a>
                                        <xsl:text>, aktiv in </xsl:text>
                                        <xsl:variable name="a"
                                            select="./tei:residence/tei:settlement/tei:placeName/text()"/>
                                        <a href="{$a}.html" target="_blank">
                                            <xsl:value-of
                                                select="./tei:residence/tei:settlement/tei:placeName"
                                            />
                                        </a>
                                    </li>
                                </xsl:for-each>
                            </ul>
                        </div>
                    </div>
                </main>
                <xsl:call-template name="html_footer"/>
            </body>
        </html>


        <xsl:for-each select=".//tei:person[@xml:id]">
            <xsl:variable name="filename" select="concat(./@xml:id, '.html')"/>
            <xsl:variable name="name"
                select="normalize-space(string-join(./tei:persName[1]//text()))"/>
            <xsl:result-document href="{$filename}">
                <html class="page">
                    <head>
                        <xsl:call-template name="html_head">
                            <xsl:with-param name="html_title" select="$name"/>
                        </xsl:call-template>
                    </head>

                    <body class="d-flex flex-column">
                        <xsl:call-template name="nav_bar"/>
                        <main class="flex-grow-1">
                            <div class="container">
                                <h2 class="text-center">
                                    <xsl:value-of select="$name"/>
                                </h2>
                                <xsl:call-template name="person_detail"/>
                            </div>
                        </main>
                        <xsl:call-template name="html_footer"/>
                    </body>
                </html>
            </xsl:result-document>
        </xsl:for-each>
    </xsl:template>
</xsl:stylesheet>
