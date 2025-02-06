<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    version="2.0" exclude-result-prefixes="xsl tei xs">

    <xsl:output encoding="UTF-8" media-type="text/html" method="html" version="5.0" indent="yes"
        omit-xml-declaration="yes"/>


    <xsl:import href="./partials/html_navbar.xsl"/>
    <xsl:import href="./partials/html_head.xsl"/>
    <xsl:import href="partials/html_footer.xsl"/>
    <xsl:template match="/">
        <xsl:variable name="doc_title" select="'Suche'"/>
        <html class="page">
            <head>
                <xsl:call-template name="html_head">
                    <xsl:with-param name="html_title" select="$doc_title"/>
                </xsl:call-template>
            </head>

            <body class="d-flex flex-column">
                <xsl:call-template name="nav_bar"/>
                <main class="flex-grow">
                <div class="container flex-1">
                    <h2 class="align-center">
                        <xsl:value-of select="$doc_title"/>
                    </h2>

                </div>
                <div class="container-md">
                        <div class="search-panel">
                            <div class="search-panel__results">
                                <div class="row">
                                    <div class="col-lg-3 col-md-4 col-12 facettes">
                                        <div id="stats-container"/>
                                        <div id="searchbox"/>
                                        <div id="clear-refinements"/>
                                        <div><xsl:text>Verwenden Sie die Filter, um die Ergebnisse zu verfeinern.</xsl:text></div>
                                        <div id="fuzzy-toggle" />
					                    <div id="refinement-list-liturgie"/>
					                    <div id="refinement-list-genre"/>
                                        <div id="refinement-list-place"/>
                                        <!-- <div id="refinement-list-doc-type"/> -->
                                        <div id="refinement-list-persons"/>
                                        <div id="refinement-range-year"/>
                                    </div>
                                    <div class="col-lg-9 col-md-8 col-12">
                                        <!--<div id="sort-by"></div>-->
                                        <div id="current-refinements"/>
                                        <div id="hits" />
                                        <div id="pagination" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <xsl:call-template name="html_footer"/>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/instantsearch.css@8.1.0/themes/algolia-min.css" />
                <link rel="stylesheet" href="css/ts_search.css"/>
                <script src="https://cdn.jsdelivr.net/npm/typesense-instantsearch-adapter@2/dist/typesense-instantsearch-adapter.min.js"/>
                <script src="https://cdn.jsdelivr.net/npm/instantsearch.js@4.66.0/dist/instantsearch.production.min.js" />
                <script src="js/ts_search.js"></script>
                <script src="js/ts_update_url.js"></script>
                <!-- <script src="js/ts_index.js"/> -->
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
