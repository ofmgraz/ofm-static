<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:local="http://dse-static.foo.bar"
    version="2.0" exclude-result-prefixes="xsl tei xs local">

    <xsl:output encoding="UTF-8" media-type="text/html" method="html" version="5.0" indent="yes"
        omit-xml-declaration="yes"/>


    <xsl:import href="partials/html_navbar.xsl"/>
    <xsl:import href="partials/html_head.xsl"/>
    <xsl:import href="partials/html_footer.xsl"/>
    <xsl:import href="partials/tabulator_dl_buttons.xsl"/>
    <xsl:import href="partials/tabulator_js.xsl"/>
    <xsl:variable name="lang" select="'de'"/>

    <xsl:template match="/">
        <xsl:variable name="doc_title" select="'Bücher'"/>



        <html class="page">
            <head>
                <xsl:call-template name="html_head">
                    <xsl:with-param name="html_title" select="$doc_title"/>
                </xsl:call-template>
            </head>
            <body class="d-flex flex-column">
                <xsl:call-template name="nav_bar"/>

                <main class="flex-grow-1 overflow-hidden">
                    <div class="container">
                        <h1 class="text-center pb-4 pt-3">
                            <xsl:value-of select="$doc_title"/>
                        </h1>

                        <table class="table" id="myTable">
                            <thead>
                                <tr>
                                    <th scope="col" tabulator-formatter="html" tabulator-responsive="0" tabulator-resizable="true" tabulator-headerFilter="input" tabulator-minWidth="300px">Titel</th>
                                    <th scope="col" tabulator-formatter="html" tabulator-visible="false"
                                        >XML-TEI</th>
                                    <th scope="col" tabulator-headerFilter="input" tabulator-responsive="1" tabulator-minWidth="150px"
                                       >TPQ</th>
                                    <th scope="col" tabulator-visible="false">TAQ</th>

                                    <th scope="col" tabulator-responsive="2" tabulator-headerFilter="input" tabulator-minWidth="150px">Liturgie</th>
                                    <th scope="col" tabulator-responsive="3" tabulator-headerFilter="input" tabulator-minWidth="150px">Dokumententyp</th>
                                    <th scope="col" tabulator-formatter="html"
                                        tabulator-visible="false" >Provenienz</th>
                                    <th scope="col" tabulator-formatter="html"
                                        tabulator-visible="false">Drucker</th>
                                    <th scope="col" tabulator-visible="false">Folia</th>
                                    <th scope="col" tabulator-visible="false">Höhe (mm)</th>
                                    <th scope="col" tabulator-visible="false">Breite (mm)</th>
                                    <th scope="col" tabulator-visible="false">Beschreibung</th>
                                    <th scope="col" tabulator-visible="false">Traskriptionstatus</th>
                                </tr>
                            </thead>
                            <tbody>
                                <xsl:for-each
                                    select="collection('../data/editions?select=*.xml')//tei:TEI">
                                    <xsl:variable name="full_path">
                                        <xsl:value-of select="document-uri(/)"/>
                                    </xsl:variable>
                                    <tr>
                                        <td>
                                            <a>
                                                <xsl:attribute name="href">
                                                  <xsl:value-of
                                                  select="replace(tokenize($full_path, '/')[last()], '.xml', '.html')"
                                                  />
                                                </xsl:attribute>
                                                <xsl:value-of
                                                  select=".//tei:titleStmt/tei:title[1]/text()"/>
                                            </a>
                                        </td>
                                        <td>
                                            <a>
                                                <xsl:attribute name="href">
                                                  <xsl:value-of
                                                  select="tokenize($full_path, '/')[last()]"/>
                                                </xsl:attribute>
                                                <xsl:value-of
                                                  select="tokenize($full_path, '/')[last()]"/>
                                            </a>
                                        </td>
                                        <td>
                                            <xsl:value-of
                                                select="tokenize(descendant::tei:sourceDesc/tei:bibl/tei:date/@notBefore, '-')[1]"
                                            />
                                        </td>
                                        <td>
                                            <xsl:value-of
                                                select="tokenize(descendant::tei:sourceDesc/tei:bibl/tei:date/@notAfter, '-')[1]"
                                            />
                                        </td>


                                        <td>
                                            <xsl:value-of
                                                select=".//tei:encodingDesc/tei:classDecl/tei:taxonomy[@xml:id = 'liturgies']/tei:category"
                                            />
                                        </td>
                                        <td>
                                            <xsl:for-each
                                                select=".//tei:encodingDesc/tei:classDecl/tei:taxonomy[@xml:id = 'booktypes']/tei:category">
                                                <xsl:value-of select="."/>
                                                <xsl:if test="position() != last()">
                                                  <xsl:text>, </xsl:text>
                                                </xsl:if>
                                            </xsl:for-each>
                                        </td>
                                        <td>
                                            <xsl:for-each
                                                select=".//tei:sourceDesc/tei:msDesc/tei:history/tei:provenance/tei:placeName">
                                                <a>
                                                  <xsl:attribute name="href">
                                                  <xsl:value-of
                                                  select="concat(translate(./@ref, '#', ''), '.html')"
                                                  />
                                                  </xsl:attribute>
                                                  <xsl:value-of select="./text()"/>
                                                </a>
                                                <xsl:if test="position() != last()">
                                                  <xsl:text>, </xsl:text>
                                                </xsl:if>
                                            </xsl:for-each>
                                        </td>
                                        <td>
                                            <xsl:choose>
                                                <xsl:when
                                                  test="descendant::tei:sourceDesc/tei:bibl/tei:publisher">
                                                  <a>
                                                  <xsl:attribute name="href">
                                                  <xsl:value-of
                                                  select="concat(translate(descendant::tei:sourceDesc/tei:bibl/tei:publisher/@ref, '#', ''), '.html')"/>
                                                  <!-- <a href="descendant::tei:sourceDesc/tei:bibl/tei:publisher">i -->
                                                  </xsl:attribute>
                                                  <xsl:value-of
                                                  select="descendant::tei:sourceDesc/tei:bibl/tei:publisher"
                                                  />
                                                  </a>
                                                </xsl:when>
                                                <xsl:otherwise>
                                                  <xsl:text>[Handschrift]</xsl:text>
                                                </xsl:otherwise>
                                            </xsl:choose>
                                        </td>
                                        <td>
                                            <xsl:value-of
                                                select="descendant::tei:sourceDesc/tei:msDesc/tei:physDesc/tei:objectDesc/tei:supportDesc/tei:extent/tei:measure/text()"/>

                                        </td>
                                        <td>
                                            <xsl:value-of
                                                select="descendant::tei:sourceDesc/tei:msDesc/tei:physDesc/tei:objectDesc/tei:supportDesc/tei:support/tei:dimensions/tei:height/text()"
                                            />
                                        </td>
                                        <td>
                                            <xsl:value-of
                                                select="descendant::tei:sourceDesc/tei:msDesc/tei:physDesc/tei:objectDesc/tei:supportDesc/tei:support/tei:dimensions/tei:width/text()"
                                            />
                                        </td>
                                        <td>
                                            <!-- <xsl:value-of
                                                select="child::tei:teiHeader[1]/tei:fileDesc[1]/tei:sourceDesc[1]/tei:msDesc[1]/tei:msContents[1]/summary[1]/text()"/> -->
                                            <xsl:value-of
                                                select="descendant::tei:sourceDesc/tei:msDesc/tei:msContents/tei:summary"
                                            />
                                        </td>
                                        <td>In progress</td>
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
    </xsl:template>
</xsl:stylesheet>
