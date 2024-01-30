<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    version="2.0" exclude-result-prefixes="xsl tei xs">

    <xsl:output encoding="UTF-8" media-type="text/html" method="html" version="5.0" indent="yes"
        omit-xml-declaration="yes"/>


    <xsl:import href="partials/html_navbar.xsl"/>
    <xsl:import href="partials/html_head.xsl"/>
    <xsl:import href="partials/html_footer.xsl"/>
    <xsl:import href="partials/tabulator_dl_buttons.xsl"/>
    <!--<xsl:import href="partials/tabulator_js.xsl"/>-->
    <xsl:import href="partials/place.xsl"/>
    <xsl:variable name="lang" select="'de'"/>

    <xsl:template match="/">
        <xsl:variable name="doc_title">
            <xsl:value-of select=".//tei:titleStmt/tei:title[@xml:lang = $lang]/text()"/>
        </xsl:variable>
        <xsl:text disable-output-escaping="yes">&lt;!DOCTYPE html&gt;</xsl:text>
        <html class="h-100">

            <head>
                <xsl:call-template name="html_head">
                    <xsl:with-param name="html_title" select="$doc_title"/>
                </xsl:call-template>
            </head>

            <body class="d-flex flex-column h-100">
                <xsl:call-template name="nav_bar"/>
                <main>
                    <div class="container">
                        <h1 class="text-center pb-4 pt-3">
                            <xsl:value-of select="$doc_title"/>
                        </h1>
                        <div id="places_div"/>
                        <table class="table" id="placesTable">
                            <thead>
                                <tr>
                                    <th scope="col" width="20" tabulator-formatter="html"
                                        tabulator-headerSort="false" tabulator-download="false"
                                        >#</th>
                                    <th scope="col" tabulator-headerFilter="input">Ortsname</th>
                                    <th scope="col" tabulator-headerFilter="input">Lat</th>
                                    <th scope="col" tabulator-headerFilter="input">Long</th>
                                    <th scope="col" tabulator-headerFilter="input">ID</th>
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
                                                <i class="bi bi-link-45deg"/>
                                            </a>
                                        </td>
                                        <td>
                                            <xsl:value-of
                                                select="./tei:placeName[@xml:lang = $lang]/text()"/>
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
                                    </tr>
                                </xsl:for-each>
                            </tbody>
                        </table>
                        <xsl:call-template name="tabulator_dl_buttons"/>
                    </div>
                </main>
                <xsl:call-template name="html_footer"/>
                <script type="text/javascript" src="https://unpkg.com/tabulator-tables@5.5.2/dist/js/tabulator.min.js"/>
                <script src="js/make_map.js"/>
                <script>
                    /*this cfg describes some of the features of the leaflet map and it't functions*/
                    let columns = [
                    {
                    headerFilter: "input",
                    title: "Ortsname",
                    field: "Ortsname",
                    formatter: "plaintext",
                    resizable: false,
                    },
                    {
                    title: "Lat",
                    field: "Lat",
                    formatter: "plaintext",
                    resizable: false,
                    },
                    {
                    title: "Long",
                    field: "Long",
                    formatter: "plaintext",
                    resizable: false,
                    },
                    ];
                    let map_cfg = {
                        div_id: "places_div",
                        json_url: "",
                        initial_zoom: "5",
                        max_zoom: "19",
                        /* zomm level for a place on the map focused by clicking the corresponding row */
                        on_row_click_zoom: "11",
                        initial_coordinates: [48.210033, 16.363449],
                        base_map_url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
                        /* some map providers need subdomains */
                        subdomains: "abcd",
                        attribution:
                            '&amp;copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &amp;copy <a href="https://carto.com/attributions">CARTO</a>',
                    };
                    /* using localization to change labels 
                    https://tabulator.info/docs/5.5/modules#module-localize */
                    let langs = {
                        default: {
                            pagination: {
                                counter: {
                                    showing: "",
                                    of: "of",
                                    rows: "",
                                },
                            },
                        },
                    };
        
                    /* this cfg describes some of the features of
                    the tabulator table and it't functions */
                    let tabulator_cfg = {
                        maxHeight: "45vh",
                        layout: "fitColumns",
                        width: "100%",
                        headerFilterLiveFilterDelay: 600,
                        responsiveLayout: "collapse",
                        paginationCounter: "rows",
                        pagination: "local",
                        paginationSize: 10,
                        langs: langs,
                        columns: columns,
                    };
        
                    let table_cfg = {
                        tabulator_cfg: tabulator_cfg,
                        table_div_html_id: "#placesTable",
                    };
        
                    build_map_and_table(map_cfg, table_cfg);
                </script>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
