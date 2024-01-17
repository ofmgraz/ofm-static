<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    version="2.0" exclude-result-prefixes="xsl tei xs">

    <xsl:output encoding="UTF-8" media-type="text/html" method="html" version="5.0" indent="yes"
        omit-xml-declaration="yes"/>


    <xsl:import href="./partials/html_navbar.xsl"/>
    <xsl:import href="./partials/html_head.xsl"/>
    <xsl:import href="partials/html_footer.xsl"/>

    <xsl:variable name="prev">
        <xsl:value-of select="replace(tokenize(data(tei:TEI/@prev), '/')[last()], '.xml', '.html')"
        />
    </xsl:variable>
    <xsl:variable name="next">
        <xsl:value-of select="replace(tokenize(data(tei:TEI/@next), '/')[last()], '.xml', '.html')"
        />
    </xsl:variable>
    <xsl:variable name="doc_title">
        <xsl:value-of select=".//tei:title[@type = 'main'][1]/text()"/>
    </xsl:variable> 

    <xsl:template match="/">
        <!-- <xsl:variable name="doc_title">
            <xsl:value-of select=".//tei:title[@type = 'main'][1]/text()"/>
        </xsl:variable> -->



        <html class="h-100">

            <head>
                <xsl:call-template name="html_head">
                    <xsl:with-param name="html_title" select="$doc_title"/>
                </xsl:call-template>
            </head>

            <body class="d-flex flex-column h-100">
                <!-- <xsl:call-template name="nav_bar"/> -->
                <!-- <main>
                    <div class="container">
                        <h1>
                            <xsl:value-of select="$doc_title"/>
                        </h1>
                        <xsl:apply-templates select=".//tei:body"/>
                    </div>
                </main>
                <xsl:call-template name="html_footer"/>
                <div class="hfeed site" id="page">
                    <xsl:call-template name="nav_bar"/>
                    <div class="container-fluid">
                        <div class="card">
                            <div class="card-header">
                                <h2 align="center">
                                    <xsl:value-of select="$doc_title"/>
                                </h2>
                            </div>
                            <div class="card-body-index">
                                <xsl:apply-templates select="descendant::tei:body"/>
                            </div>
                        </div>
                    </div>
                    <xsl:call-template name="html_footer"/>
                </div> -->
                <div class="hfeed site" id="page">
                    <xsl:call-template name="nav_bar">
                        <xsl:with-param name="edition_buttons" as="xs:boolean" select="true()"/>
                    </xsl:call-template>
                    <div class="edition_container ">
                            <div class="offcanvas offcanvas-start" tabindex="-1"
                            id="offcanvasNavigation" aria-labelledby="offcanvasNavigationLabel"
                            data-bs-scroll="true" data-bs-backdrop="false">
                                <div class="offcanvas-header">
                                    <h5 class="offcanvas-title" id="offcanvasNavigationLabel"
                                    >Navigation</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="offcanvas"
                                    aria-label="Close"/>
                                </div>
                                <!-- <div class="offcanvas-body">
                                    <div>
                                        <xsl:call-template name="edition_side_nav">
                                            <xsl:with-param name="doc_title" select="$doc_title"/>
                                        </xsl:call-template>
                                    </div>
                                </div> -->
                            </div>
                        <div class="wp-transcript">
                            <div class="card-header">
                                <div class="row" id="edition_metadata">
                                   <div class="offcanvas offcanvas-end" tabindex="0"
                                        id="offcanvasOptions"
                                        aria-labelledby="offcanvasOptionsLabel"
                                        data-bs-scroll="true" data-bs-backdrop="false">
                                        <div class="offcanvas-header">
                                            <h5 class="offcanvas-title" id="offcanvasOptionsLabel"
                                                >Einstellungen</h5>
                                            <button type="button" class="btn-close"
                                                data-bs-dismiss="offcanvas" aria-label="Close"/>
                                        </div>
                                        <div class="offcanvas-body">
                                            <div>
                                                <ul id="edition_display_options"
                                                  class="list-unstyled fw-normal pb-1 small">
                                                  <!--<li >
                                                         <full-size opt="fls"></full-size>
                                                         </li>-->
                                                  <li>
                                                  <image-switch opt="es"/>
                                                  </li>
                                                  <li>
                                                  <font-size opt="fs"/>
                                                  </li>
                                                  <!--<li >
                                                         <font-family opt="ff"></font-family>
                                                         </li>-->
                                                  <li>
                                                  <annotation-slider opt="ef"/>
                                                  </li>
                                                  <li>
                                                  <annotation-slider opt="prs"/>
                                                  </li>
                                                  <!--<li >
                                                         <annotation-slider opt="plc"></annotation-slider>
                                                         </li>-->
                                                  <li>
                                                  <annotation-slider opt="wrk"/>
                                                  </li>
                                                  <li>
                                                  <annotation-slider opt="org"/>
                                                  </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-2 col-lg-2 col-sm-12">
                                        <xsl:if test="ends-with($prev, '.html')">
                                            <h1>
                                                <a style="background-color:red">
                                                  <xsl:attribute name="href">
                                                  <xsl:value-of
                                                  select="replace($prev, '.html', '_facsimile.html')"
                                                  />
                                                  </xsl:attribute>
                                                  <i class="fas fa-chevron-left" title="prev"/>
                                                </a>
                                            </h1>
                                        </xsl:if>
                                    </div>
                                    <div id="docinfo" class="col-md-8 col-lg-8 col-sm-12">
                                        <xsl:variable name="doc_type"
                                            select="//tei:sourceDesc/tei:msDesc/tei:physDesc/tei:objectDesc/@form[1]"/>
                                        <div>
                                            <h1>
                                                <xsl:value-of select="$doc_title"/>
                                            </h1>
                                        </div> 
                                        <div class="container-fluid">
                                           <!-- <div class="card">
                                                <div class="card-body-index">  -->
                                                    <xsl:apply-templates select="descendant::tei:body"/>
                                               <!-- </div>
                                            </div>  -->
                                        </div>
                                        <!-- <p class="document_info">Entstehung: <xsl:value-of
                                                select="normalize-space(//tei:profileDesc/tei:creation/tei:date[1])"
                                            /></p>
                                        <p class="document_info">
                                            <xsl:value-of select="//tei:text/@type"/>
                                        </p>
                                        <p class="document_info">Beteiligte Personen: <xsl:value-of
                                                select="string-join((//tei:msDesc/tei:msContents/tei:msItem/tei:author/text()), ' / ')"
                                            /></p> -->
                                        <p class="document_info">
                                            <xsl:value-of
                                                select="normalize-space(//tei:sourceDesc/tei:msDesc/tei:physDesc/tei:objectDesc)"
                                            />
                                        </p>
                                    </div>
                                    <div class="col-md-2 col-lg-2 col-sm-12"
                                        style="text-align:right">
                                        <xsl:if test="ends-with($next, '.html')">
                                            <h1>
                                                <a>
                                                  <xsl:attribute name="href">
                                                  <xsl:value-of
                                                  select="replace($next, '.html', '_facsimile.html')"
                                                  />
                                                  </xsl:attribute>
                                                  <i class="fas fa-chevron-right" title="next"/>
                                                </a>
                                            </h1>
                                        </xsl:if>
                                    </div>
                                </div>
                            </div>
                            <div id="container-resize" class="row transcript active">
                                <div id="img-resize" class="col-md-6 col-lg-6 col-sm-12 facsimiles">
                                    <div id="viewer">
                                        <div id="container_facs_1">
                                            <!-- container and facs handling in js -->
                                        </div>
                                    </div>
                                </div>
                                <div id="text-resize"
                                    class="col-md-6 col-lg-6 col-sm-12 text yes-index">
                                    <div id="section">
                                        <xsl:for-each select="//tei:body/tei:div">
                                            <div class="card-body non_mimetic_lbs">
                                                <xsl:apply-templates/>
                                            </div>
                                            <xsl:if test="//tei:note[@type = 'footnote']">
                                                <div class="card-footer">
                                                  <a class="anchor" id="footnotes"/>
                                                  <ul class="footnotes">
                                                  <xsl:for-each select="//tei:note[@place = 'foot']">
                                                  <li>
                                                  <a class="anchorFoot" id="{@xml:id}"/>
                                                  <span class="footnote_link">
                                                  <a href="#{@xml:id}_inline" class="nounderline">
                                                  <xsl:value-of select="@n"/>
                                                  </a>
                                                  </span>
                                                  <span class="footnote_text">
                                                  <xsl:apply-templates/>
                                                  </span>
                                                  </li>
                                                  </xsl:for-each>
                                                  </ul>
                                                </div>
                                            </xsl:if>
                                        </xsl:for-each>
                                    </div>
                                </div>
                            </div>
                            <!-- create list* elements for entities bs-modal -->
                            <xsl:for-each select="//tei:back">
                                <div class="tei-back">
                                    <xsl:apply-templates/>
                                </div>
                            </xsl:for-each>
                        </div>
                    </div>

                    <xsl:call-template name="html_footer"/>
                </div>
                <script src="https://unpkg.com/de-micro-editor@0.2.6/dist/de-editor.min.js"/>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/openseadragon.min.js"/>
                <script type="text/javascript" src="js/osd_scroll.js"/>
                <script type="text/javascript" src="js/run.js"/>
                <script type="text/javascript" src="js/offcanvastoggler.js"/>
            </body>
        </html>
    </xsl:template>
    <xsl:template match="tei:body">
        <xsl:if test="descendant::tei:div[starts-with(@type, 'level')]">
            <xsl:element name="nav">
                <xsl:attribute name="style">
                    <xsl:text>z-index: 0;</xsl:text>
                    <xsl:text>margin: 3em;</xsl:text>
                </xsl:attribute>
                <xsl:attribute name="id">
                    <xsl:text>page-toc</xsl:text>
                </xsl:attribute>
                <xsl:attribute name="class">
                    <xsl:text>navbar navbar-light</xsl:text>
                </xsl:attribute>
                <div class="container">
                    <a class="navbar-brand" href="#">Inhaltsverzeichnis</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#verticalNavbar" aria-controls="verticalNavbar"
                        aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"/>
                    </button>
                    <div class="collapse navbar-collapse" id="verticalNavbar">
                        <!-- Wenn es divs mit level gibt, Inhaltsverzeichnis am Anfang der Seite -->
                        <xsl:element name="ul">
                            <xsl:attribute name="class">
                                <xsl:text>navbar-nav</xsl:text>
                            </xsl:attribute>
                            <xsl:apply-templates select="child::tei:div[@type = 'level1']"
                                mode="nav"/>
                        </xsl:element>
                    </div>
                </div>
            </xsl:element>
        </xsl:if>
        <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="tei:head" mode="nav">
        <xsl:variable name="linktarget" select="concat('#', @xml:id)"/>
        <li>
            <xsl:attribute name="class">
                <xsl:text>nav-item</xsl:text>
            </xsl:attribute>
            <a href="{$linktarget}">
                <xsl:value-of select="normalize-space(.)"/>
            </a>
        </li>
    </xsl:template>
    <xsl:template match="tei:p[@rend = 'center']">
        <p align="center">
            <xsl:apply-templates/>
        </p>
    </xsl:template>
    <xsl:template match="tei:p">
        <p id="{generate-id()}">
            <xsl:apply-templates/>
        </p>
    </xsl:template>
    <xsl:template match="tei:div">
        <div id="{generate-id()}">
            <xsl:apply-templates/>
        </div>
    </xsl:template>
    <xsl:template match="tei:head[not(@type = 'sub')]">
        <h2>
            <xsl:if test="@xml:id">
                <xsl:attribute name="id">
                    <xsl:value-of select="@xml:id"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:apply-templates/>
        </h2>
    </xsl:template>
    <xsl:template match="tei:head[(@type = 'sub')]">
        <h3>
            <xsl:if test="@xml:id">
                <xsl:attribute name="id">
                    <xsl:value-of select="@xml:id"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:apply-templates/>
        </h3>
    </xsl:template>
    <xsl:template match="tei:listPlace">
        <ul>
            <xsl:apply-templates select="tei:place" mode="listPlace"/>
        </ul>
    </xsl:template>
    <xsl:template match="tei:place" mode="listPlace">
        <li>
            <xsl:apply-templates select="tei:placeName" mode="listTitle"/>
            <table>
                <xsl:apply-templates select="tei:*[not(self::tei:placeName)]" mode="tabelle"/>
            </table>
        </li>
    </xsl:template>
    <xsl:template match="tei:placeName | tei:persName | tei:title" mode="listTitle">
        <b>
            <xsl:apply-templates/>
        </b>
        <br/>
    </xsl:template>
    <xsl:template match="tei:org/tei:place" mode="tabelle">
        <tr>
            <th>Ort</th>
            <td>
                <xsl:apply-templates select="tei:placeName" mode="tabelle"/>
            </td>
        </tr>
        <tr>
            <th/>
            <td>
                <xsl:apply-templates select="tei:location" mode="tabelle"/>
            </td>
        </tr>
    </xsl:template>
    <!-- LISTPERS -->
    <xsl:template match="tei:listPerson">
        <ul>
            <xsl:apply-templates mode="listPerson"/>
        </ul>
    </xsl:template>
    <xsl:template match="tei:person" mode="listPerson">
        <li>
            <xsl:apply-templates select="tei:persName" mode="listTitle"/>
            <table>
                <xsl:choose>
                    <xsl:when test="tei:birth and tei:death">
                        <tr>
                            <xsl:choose>
                                <xsl:when test="tei:birth = tei:death">
                                    <th>Vorkommen</th>
                                    <td>
                                        <xsl:value-of select="tei:birth"/>
                                    </td>
                                </xsl:when>
                                <xsl:otherwise>
                                    <th>Lebensdaten</th>
                                    <td>
                                        <xsl:value-of select="concat(tei:birth, '–', tei:death)"/>
                                    </td>
                                </xsl:otherwise>
                            </xsl:choose>
                        </tr>
                    </xsl:when>
                    <xsl:when test="tei:birth">
                        <tr>
                            <th>Geburt</th>
                            <td>
                                <xsl:value-of select="tei:birth"/>
                            </td>
                        </tr>
                    </xsl:when>
                    <xsl:when test="tei:death">
                        <tr>
                            <th>Tod</th>
                            <td>
                                <xsl:value-of select="tei:death"/>
                            </td>
                        </tr>
                    </xsl:when>
                </xsl:choose>
                <xsl:apply-templates
                    select="tei:*[not(self::tei:persName or self::tei:birth or self::tei:death)]"
                    mode="tabelle"/>
            </table>
        </li>
    </xsl:template>
    <xsl:template match="tei:occupation" mode="tabelle">
        <tr>
            <th>Beruf</th>
            <td>
                <xsl:value-of select="."/>
            </td>
        </tr>
    </xsl:template>
    <xsl:template match="tei:location" mode="tabelle">
        <xsl:variable name="lat" select="tokenize(tei:geo, ' ')[1]"/>
        <xsl:variable name="long" select="tokenize(tei:geo, ' ')[2]"/>
        <tr>
            <th>Länge/Breite</th>
            <td>
                <xsl:element name="a">
                    <xsl:attribute name="href">
                        <xsl:value-of
                            select="concat('https://www.openstreetmap.org/?mlat=', $lat, '&amp;mlon=', $long)"
                        />
                    </xsl:attribute>
                    <xsl:value-of select="concat($lat, '/', $long)"/>
                </xsl:element>
            </td>
        </tr>
    </xsl:template>
    <!--     <xsl:template match="tei:p">
<p id="{generate-id()}"><xsl:apply-templates/></p>
</xsl:template>
<xsl:template match="tei:div">
<div id="{generate-id()}"><xsl:apply-templates/></div>
</xsl:template>
<xsl:template match="tei:lb">
<br/>
</xsl:template>
<xsl:template match="tei:unclear">
<abbr title="unclear"><xsl:apply-templates/></abbr>
</xsl:template>
<xsl:template match="tei:del">
<del><xsl:apply-templates/></del>
</xsl:template>     -->
</xsl:stylesheet>
