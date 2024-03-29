<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    version="2.0" exclude-result-prefixes="xsl tei xs">

    <xsl:output encoding="UTF-8" media-type="text/html" method="html" version="5.0" indent="yes"
        omit-xml-declaration="yes"/>


    <xsl:import href="./partials/html_navbar.xsl"/>
    <xsl:import href="./partials/html_head.xsl"/>
    <xsl:import href="./partials/html_footer.xsl"/>
    <xsl:import href="partials/tabulator_dl_buttons.xsl"/>
    <xsl:import href="partials/tabulator_js.xsl"/>
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
                    <div class="container">
                        <h1 class="text-center pb-4 pt-3">
                            <xsl:value-of select="$doc_title"/>
                        </h1>

                        <table class="table" id="myTable">
                            <thead>
                                <tr>
                                    <th scope="col" tabulator-formatter="html">Name</th>
                                    <th scope="col" tabulator-formatter="html"
                                        tabulator-download="false">Aktiv in</th>
                                    <th scope="col" tabulator-visible="false">ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                <xsl:for-each select=".//tei:person[@xml:id]">
                                    <xsl:variable name="id">
                                        <xsl:value-of select="data(@xml:id)"/>
                                    </xsl:variable>
                                    <tr>
                                        <td>
                                            <a>
                                                <xsl:attribute name="href">
                                                  <xsl:value-of select="concat($id, '.html')"/>
                                                </xsl:attribute>
                                                <xsl:value-of select=".//tei:forename/text()"/>
                                                <xsl:text> </xsl:text>
                                                <xsl:value-of select=".//tei:surname/text()"/>
                                            </a>
                                        </td>
                                        <td>
                                            <xsl:variable name="a"
                                                select="./tei:residence/tei:settlement/tei:placeName/text()"/>
                                            <a href="{$a}.html" target="_blank">
                                                <xsl:value-of
                                                  select="./tei:residence/tei:settlement/tei:placeName"
                                                />
                                            </a>
                                        </td>
                                        <td>
                                            <xsl:value-of select="$id"/>
                                        </td>
                                    </tr>
                                </xsl:for-each>
                            </tbody>
                        </table>
                        <xsl:call-template name="tabulator_dl_buttons"/>
                    </div>
                </main>
                <xsl:call-template name="tabulator_js"/>
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
                                <h1 class="text-center pb-4 pt-3">
                                    <xsl:value-of select="$name"/>
                                </h1>
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
