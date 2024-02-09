<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:local="http://dse-static.foo.bar" version="2.0" exclude-result-prefixes="xsl tei xs local">

    <xsl:output encoding="UTF-8" media-type="text/html" method="html" version="5.0" indent="yes"
        omit-xml-declaration="yes"/>

    <xsl:import href="./partials/shared.xsl"/>
    <xsl:import href="./partials/html_navbar.xsl"/>
    <xsl:import href="./partials/html_head.xsl"/>
    <xsl:import href="./partials/html_footer.xsl"/>
    <xsl:import href="./partials/osd-container.xsl"/>
    <xsl:import href="partials/tei-facsimile.xsl"/>
    <xsl:import href="./partials/entities.xsl"/>
    <xsl:import href="partials/edition_side_nav.xsl"/>
    <xsl:import href="./partials/html_title_navigation.xsl"/>

    <xsl:variable name="prev">ls <xsl:value-of
            select="replace(tokenize(data(tei:TEI/@prev), '/')[last()], '.xml', '.html')"/>
    </xsl:variable>
    <xsl:variable name="next">
        <xsl:value-of select="replace(tokenize(data(tei:TEI/@next), '/')[last()], '.xml', '.html')"
        />
    </xsl:variable>
    <xsl:variable name="teiSource">
        <xsl:value-of select="data(tei:TEI/@xml:id)"/>
        <xsl:text>.xml</xsl:text>
    </xsl:variable>
    <xsl:variable name="doc_title">
        <xsl:value-of select=".//tei:titleStmt/tei:title[1]/text()"/>
    </xsl:variable>
    <xsl:variable name="link">
        <xsl:value-of select="replace($teiSource, '.xml', '.html')"/>
    </xsl:variable>
    <xsl:param name="mybreak"><![CDATA[<br />]]></xsl:param>
    <xsl:param name="mytab"><![CDATA[&emsp;]]></xsl:param>

    <xsl:template match="/">
        <xsl:text disable-output-escaping="yes">&lt;!DOCTYPE html&gt;</xsl:text>
        <html class="page"  lang="de">
            <head>
                <xsl:call-template name="html_head">
                    <xsl:with-param name="html_title" select="$doc_title"/>
                </xsl:call-template>
            </head>
            <body class="d-flex flex-column">
                <div class="hfeed site flex-grow-1" id="page">
                    <xsl:call-template name="nav_bar"/>
                    <div class="edition_container ">
                        <div class="offcanvas offcanvas-start" tabindex="-1"
                            id="offcanvasNavigation" aria-labelledby="offcanvasNavigationLabel"
                            data-bs-scroll="true" data-bs-backdrop="false">
                            <div class="offcanvas-header">
                                <!-- <h5 class="offcanvas-title" id="offcanvasNavigationLabel"
                                    >Navigation</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="offcanvas"
                                    aria-label="Close"/> -->
                            </div>
                            <div class="offcanvas-body">
                                <!-- <div>
                                    <xsl:call-template name="edition_side_nav">
                                        <xsl:with-param name="doc_title" select="$doc_title"/>
                                    </xsl:call-template>
                                </div> -->
                            </div>
                        </div>
                        <div class="offcanvas offcanvas-end" tabindex="0" id="offcanvasOptions"
                            aria-labelledby="offcanvasOptionsLabel" data-bs-scroll="true"
                            data-bs-backdrop="false">
                            <!-- <div class="offcanvas-header">
                                <h5 class="offcanvas-title" id="offcanvasOptionsLabel"
                                    >Einstellungen</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="offcanvas"
                                    aria-label="Close"/>
                            </div> -->
                        </div>
                        <div class="wp-transcript">
                            <div class="row" id="edition_metadata">
                                <div class="col-md-8 col-lg-8 col-sm-12 docinfo">
                                    <xsl:variable name="doc_type"
                                        select="//tei:sourceDesc/tei:msDesc/tei:physDesc/tei:objectDesc/@form[1]"/>
                                    <h1 align="center">
                                        <xsl:value-of select="$doc_title"/>
                                    </h1>
                                    <h3 align="center">
                                        <a href="{$teiSource}">
                                            <i class="bi bi-download" title="TEI/XML"/>
                                        </a>
                                    </h3>
                                    <p class="document_info archival_small" align="center">
                                        <xsl:value-of
                                            select="normalize-space(//tei:profileDesc/tei:creation/tei:date[1])"
                                        />
                                    </p>
                                    <p class="document_info archival_small" align="center">
                                        <xsl:value-of select="//tei:text/@type"/>
                                        <xsl:value-of
                                            select="concat(' (', normalize-space($doc_type)), ')'"/>
                                    </p>
                                    <p class="document_info archival_small" align="center">
                                        <xsl:value-of
                                            select='//tei:msDesc/tei:msIdentifier/tei:idno[@type = "archive"]/text()[1]/normalize-space()'
                                        />
                                    </p>
                                    <xsl:variable name="text_status"
                                        select="//tei:teiHeader/tei:revisionDesc/@status"/>
                                    <xsl:variable name="changes"
                                        select="//tei:teiHeader/tei:revisionDesc/tei:change"/>
                                    <xsl:choose>
                                        <xsl:when test="$text_status = 'created'">
                                            <div align="center">
                                                <xsl:attribute name="class">
                                                  <xsl:value-of
                                                  select="concat('revision_desc ', $text_status)"/>
                                                </xsl:attribute> maschinell erfasster Rohtext </div>
                                        </xsl:when>
                                        <xsl:otherwise>
                                            <div align="center">
                                                <xsl:attribute name="class">
                                                  <xsl:value-of select="'revision_desc created'"/>
                                                </xsl:attribute> maschinell erfasster Rohtext </div>
                                        </xsl:otherwise>
                                    </xsl:choose>
                                </div>
                            </div>
                            <div id="container-resize" class="row transcript active">
                                <div id="img-resize" class="col-md-6 col-lg-6 col-sm-12 facsimiles">
                                    <div id="viewer">
                                        <div id="container_facs_1"/>
                                        <!-- container and facs handling in js -->
                                    </div>
                                </div>
                                <div id="text-resize" lang="de"
                                    class="col-md-6 col-lg-6 col-sm-12 text yes-index">
                                    <div id="section">
                                        <xsl:for-each select="//tei:body/tei:div">
                                            <div class="card-body non_mimetic_lbs">
                                                <xsl:apply-templates/>
                                            </div>
                                        </xsl:for-each>
                                    </div>
                                </div>
                            </div>
                            <!-- create list* elements for entities bs-modal -->
                        </div>
                    </div>
                    
                </div>
                <xsl:call-template name="html_footer"/>
                <script src="https://unpkg.com/de-micro-editor@0.2.84/dist/de-editor.min.js"/>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/openseadragon.min.js"/>
                <script type="text/javascript" src="js/osd_scroll.js"/>
                <!-- <script type="text/javascript" src="js/run.js"/> -->
                <script type="text/javascript" src="js/offcanvastoggler.js"/>
            </body>
        </html>
    </xsl:template>

    <xsl:template match="tei:div[parent::tei:div]">
        <!-- this is for sections, subsections and articles-->
        <xsl:variable name="type_attrib" select="@type"/>
        <div>
            <xsl:attribute name="class">
                <xsl:value-of select="$type_attrib"/>
            </xsl:attribute>
            <xsl:apply-templates/>
        </div>
    </xsl:template>

    <xsl:template match="tei:pb">
        <!-- needed for scrolling / numbering -->
        <span class="anchor-pb"/>
        <!-- determine img src -->
        <xsl:variable name="pbId">
            <xsl:value-of select="replace(data(@facs), '#', '')"/>
        </xsl:variable>
        <xsl:variable name="surfaceNode" as="node()">
            <xsl:value-of select="//tei:graphic[@xml:id = $pbId]"/>
        </xsl:variable>
        <xsl:variable name="facsUrl">
            <xsl:value-of select="data(//tei:surface[@xml:id = $pbId]/tei:graphic/@url)"/>
        </xsl:variable>
        <xsl:variable name="page_number">
            <xsl:number level="any"/>
        </xsl:variable>
        <span class="pb" source="{$facsUrl}" n="{$page_number}"
            style="--page_before: '{($page_number - 1)}'; --beginning_page: '{$page_number}';"> </span>
        <span class="pb_marker" n="{$page_number}"/>
    </xsl:template>
    <xsl:template match="tei:ab">
        <p>
            <xsl:apply-templates/>
        </p>
    </xsl:template>
    <!--  <xsl:template match="tei:p">
        <p id="{local:makeId(.)}" data-id="{@facs}">
            <xsl:for-each-group select="node()[normalize-space(.) or name(.)]"
                group-starting-with="self::tei:lb">
                <span class="transcript-line">
                    <span class="transcript-line-number">
                        <xsl:apply-templates select="current-group()[self::tei:lb]"/>
                    </span>
                    <span class="transcript-line-contents">
                        <xsl:for-each select="current-group()[not(name() = 'lb')]">
                            <xsl:apply-templates select="."/>
                        </xsl:for-each>
                    </span>
                </span>
            </xsl:for-each-group>
        </p>
    </xsl:template> -->


    <!-- <xsl:template match="tei:ab">
       AAAAAA
      <xsl:apply-templates />
        <p>
            <xsl:apply-templates/>
        </p>
     </xsl:template> -->



    <xsl:template match="text()[following-sibling::tei:lb[1]]">
        <xsl:value-of select="."/>
        <span class="tei_lb"/>
        <br/>
        <xsl:value-of select="$mybreak" disable-output-escaping="yes"/>
    </xsl:template>


    <xsl:template match="tei:lb"/>
    <xsl:template match="tei:kkkkkkk">
        <xsl:variable name="idx" select="format-number(number(replace(@n, 'N', '')), '#')"/>
        <xsl:value-of select="$mybreak" disable-output-escaping="yes"/>
        <a>
            <!-- <xsl:variable name="para" as="xs:int">
                <xsl:number level="any" from="tei:body" count="tei:p"/>
            </xsl:variable> -->
            <xsl:variable name="lines" as="xs:int">
                <xsl:number level="any" from="tei:body"/>
            </xsl:variable>
            <!--<xsl:variable name="pID">
                <xsl:value-of select="data(substring-after(parent::tei:p/@facs, '#'))"/>
            </xsl:variable>
            <xsl:variable name="surface"
                select="//tei:surface/tei:zone[@xml:id = $pID]/parent::tei:surface"/>
            <xsl:variable name="zones"
                select="//tei:surface/tei:zone[@xml:id = $pID]/tei:zone[number($idx)]"/>
            <xsl:attribute name="href">
                <xsl:value-of select="parent::tei:pb/@facs"/>
                <xsl:text>__p</xsl:text>
                <xsl:value-of select="$para"/>
                <xsl:text>__lb</xsl:text>
                <xsl:value-of select="$lines"/>
            </xsl:attribute> -->
            <!--  <xsl:attribute name="name"> 
                <xsl:value-of select="parent::tei:p/@facs"/>
                <xsl:text>__p</xsl:text>
                <xsl:value-of select="$para"/>
                <xsl:text>__lb</xsl:text>
                <xsl:value-of select="$lines"/>
            </xsl:attribute> -->
            <!-- <xsl:attribute name="id">
                <xsl:value-of select="parent::tei:p/@facs"/>
                <xsl:text>__p</xsl:text>
                <xsl:value-of select="$para"/>
                <xsl:text>__lb</xsl:text>
                <xsl:value-of select="$lines"/> 
            </xsl:attribute>
            <xsl:attribute name="size">
                <xsl:value-of select="concat($surface/@lrx, ',', $surface/@lry)"/>
            </xsl:attribute>
            <xsl:attribute name="zone">
                <xsl:value-of select="$zones/@points"/>
            </xsl:attribute>-->
            <xsl:choose>
                <xsl:when test="($lines mod 5) = 0">
                    <xsl:attribute name="class">
                        <xsl:text>linenumbersVisible linenumbers</xsl:text>
                    </xsl:attribute>
                    <xsl:attribute name="data-lbnr">
                        <xsl:value-of select="$lines"/>
                    </xsl:attribute>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:attribute name="class">
                        <xsl:text>linenumbersTransparent linenumbers</xsl:text>
                    </xsl:attribute>
                </xsl:otherwise>
            </xsl:choose>
            <xsl:value-of select="format-number($lines, '0000')"/>
        </a>
        <xsl:value-of select="$mytab" disable-output-escaping="yes"/>
    </xsl:template>

    <!-- simply keep paragraphs -->
    <xsl:template match="tei:p | tei:lg">
        <p>
            <xsl:apply-templates/>
        </p>
    </xsl:template>

    <!-- delete empty p/hi/div elements -->
    <xsl:template match="
            *[
            (
            local-name() = 'p'
            or local-name() = 'hi'
            or local-name() = 'div'
            )
            and
            not(@* | * | comment() | processing-instruction())
            and normalize-space() = '']"/>

    <xsl:template match="//tei:body//tei:head">
        <!-- find level of head between 1 and 6, the level is not semantical, the hirarchy never interruptet-->
        <xsl:variable name="head_level_number_raw"
            select="count(ancestor::tei:div[ancestor::tei:body/tei:div])"/>
        <xsl:variable name="head_level_number">
            <xsl:choose>
                <xsl:when test="$head_level_number_raw gt 6">6</xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$head_level_number_raw"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <!-- determine if article or section -->
        <xsl:variable name="item_class">
            <xsl:choose>
                <xsl:when test="ancestor::tei:div[1][@type = 'article']">
                    <xsl:value-of select="'article'"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="ancestor::tei:div[1]/@type"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <!-- create hn element -->
        <xsl:variable name="head_name" select="concat('h', $head_level_number)"/>
        <xsl:element name="{$head_name}">
            <xsl:attribute name="class">
                <xsl:value-of select="$item_class"/>
            </xsl:attribute>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="tei:a[contains(@class, 'navigation_')]">
        <a class="{@class}" id="{@xml:id}">
            <xsl:apply-templates/>
        </a>
    </xsl:template>
</xsl:stylesheet>
