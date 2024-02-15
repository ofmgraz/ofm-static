<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    version="2.0" exclude-result-prefixes="xsl tei xs">

    <xsl:output encoding="UTF-8" media-type="text/html" method="html" version="5.0" indent="yes"
        omit-xml-declaration="yes"/>


    <xsl:import href="partials/html_navbar.xsl"/>
    <xsl:import href="partials/html_head.xsl"/>
    <xsl:import href="partials/html_footer.xsl"/>
    <!-- <xsl:import href="partials/tabulator_dl_buttons.xsl"/>
<xsl:import href="partials/tabulator_js.xsl"/> -->
    <xsl:import href="partials/place.xsl"/>
    <xsl:variable name="lang" select="'de'"/>

    <xsl:template match="/">
        <xsl:variable name="doc_title">
            <xsl:value-of select=".//tei:titleStmt/tei:title[@xml:lang = $lang]/text()"/>
        </xsl:variable>
        <!--<xsl:text disable-output-escaping="yes">&lt;!DOCTYPE html&gt;</xsl:text> -->
        <html class="page" lang="de">
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

                        <div id="places_div"/>
                        <div class="container-fluid">
                            <table class="table" id="myTable">
                                <thead>
                                    <tr>
                                        <th scope="col" tabulator-formatter="html">Name</th>
                                        <th scope="col" tabulator-visible="false">lat</th>
                                        <th scope="col" tabulator-visible="false">lng</th>
                                        <th scope="col" tabulator-visible="false">id</th>
                                        <th scope="col" tabulator-formatter="html">Normdaten</th>
                                        <th scope="col" tabulator-formatter="html">Objekte</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <xsl:for-each select=".//tei:place">
                                        <xsl:variable name="id">
                                            <xsl:value-of select="data(@xml:id)"/>
                                        </xsl:variable>
                                        <tr>
                                            <td>
                                                <a>
                                                  <xsl:attribute name="href">
                                                  <xsl:value-of select="concat($id, '.html')"/>
                                                  </xsl:attribute>
                                                  <xsl:value-of
                                                  select="./tei:placeName[@xml:lang = $lang]/text()"
                                                  />
                                                </a>
                                            </td>
                                            <td>
                                                <xsl:choose>
                                                  <xsl:when test="./tei:location[1]/tei:geo[1]">
                                                  <xsl:value-of
                                                  select="tokenize(./tei:location[1]/tei:geo[1]/text(), ' ')[1]"
                                                  />
                                                  </xsl:when>
                                                </xsl:choose>
                                            </td>
                                            <td>
                                                <xsl:choose>
                                                  <xsl:when test="./tei:location[1]/tei:geo[1]">
                                                  <xsl:value-of
                                                  select="tokenize(./tei:location[1]/tei:geo[1]/text(), ' ')[last()]"
                                                  />
                                                  </xsl:when>
                                                </xsl:choose>
                                            </td>
                                            <td> # <xsl:value-of select="$id"/>
                                            </td>
                                            <td>
                                                <ul>
                                                  <xsl:for-each select="./tei:idno">

                                                  <li>
                                                  <a>
                                                  <xsl:attribute name="href">
                                                  <xsl:value-of
                                                  select="tokenize(./text(), ' ')[last()]"/>
                                                  </xsl:attribute>
                                                  <xsl:value-of select="./@subtype"/>
                                                  </a>
                                                  </li>

                                                  </xsl:for-each>
                                                </ul>
                                            </td>
                                            <td>
                                                <ul>
                                                  <xsl:for-each select="./tei:listEvent/tei:event">
                                                  <li>
                                                  <a
                                                  href="{replace(./tei:linkGrp/tei:link/@target, '.xml', '.html')}">
                                                  <xsl:value-of select="./tei:p/tei:title/text()"/>
                                                  </a>
                                                  </li>
                                                  </xsl:for-each>
                                                </ul>
                                            </td>
                                        </tr>
                                    </xsl:for-each>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
                <xsl:call-template name="html_footer"/>
                <script type="text/javascript" src="https://unpkg.com/tabulator-tables@5.6.0/dist/js/tabulator.min.js"/>
                <script src="js/make_map_and_table.js"/>
                <script src="js/map_table_cfg.js"/>
                <script>
build_map_and_table(map_cfg, table_cfg);
</script>
                <!--  <xsl:call-template name="tabulator_js"/> -->
            </body>
        </html>
        <xsl:for-each select=".//tei:place[@xml:id]">
            <xsl:variable name="filename" select="concat(./@xml:id, '.html')"/>
            <xsl:variable name="name"
                select="normalize-space(string-join(./tei:placeName[@xml:lang = $lang]//text()))"/>
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
                                <xsl:if test="./tei:location/tei:geo">
                                    <div id="map_detail"/>
                                </xsl:if>
                                <xsl:call-template name="place_detail"/>

                            </div>
                        </main>
                        <xsl:call-template name="html_footer"/>
                        <xsl:if test="./tei:location/tei:geo">
                            <link rel="stylesheet"
                                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                                crossorigin=""/>
                            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""/>
                            <script>
var lat = <xsl:value-of select="tokenize(./tei:location[1]/tei:geo[1]/text(), ' ')[1]"/>;
var long = <xsl:value-of select="tokenize(./tei:location[1]/tei:geo[1]/text(), ' ')[last()]"/>;
$("#map_detail").css("height", "500px");
var map = L.map('map_detail').setView([Number(lat), Number(long)], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
maxZoom: 19,
attribution: '&amp;copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
var marker = L.marker([Number(lat), Number(long)]).addTo(map);
</script>
                        </xsl:if>
                    </body>
                </html>
            </xsl:result-document>
        </xsl:for-each>
    </xsl:template>
</xsl:stylesheet>
