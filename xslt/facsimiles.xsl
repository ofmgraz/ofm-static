<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:local="http://dse-static.foo.bar" exclude-result-prefixes="xsl tei xs local"
     version="2.0">
    <xsl:output encoding="UTF-8" media-type="text/html" method="html" version="5.0" indent="yes"
        omit-xml-declaration="yes" />
    <xsl:import href="./partials/shared.xsl"/>
    <xsl:import href="./partials/html_navbar.xsl"/>
    <xsl:import href="./partials/html_head.xsl"/>
    <xsl:import href="./partials/html_footer.xsl"/>
    <xsl:import href="./partials/osd-container.xsl"/>
    <xsl:import href="partials/tei-facsimile.xsl"/>
    <xsl:import href="./partials/entities.xsl"/>
    <xsl:import href="partials/edition_side_nav.xsl"/>
    <xsl:import href="./partials/html_title_navigation.xsl"/>
    <xsl:import href="./partials/aot-options.xsl"/>
    <xsl:variable name="prev">
        <xsl:value-of
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
    <xsl:param name="mybreak"><![CDATA[<br/>]]></xsl:param>
    <xsl:param name="mytab"><![CDATA[&emsp;]]></xsl:param>
    <xsl:param name="myplaceholder"><![CDATA[&zwnj;]]></xsl:param>
    <xsl:param name="myline"><![CDATA[<hr />]]></xsl:param>
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
                        <div class="wp-transcript">
                            <div class="row" id="edition_metadata">
                                <div class="col-md-2 col-lg-2 col-sm-12">
                                    <xsl:if test="ends-with($prev,'.html')">
                                        <h1>
                                            <a>
                                                <xsl:attribute name="href">
                                                    <xsl:value-of select="$prev"/>
                                                </xsl:attribute>
                                                <i class="bi bi-chevron-left" title="zurück"/>
                                            </a>
                                        </h1>
                                    </xsl:if>
                                </div>
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
                                </div>
                                <div class="col-md-2 col-lg-2 col-sm-12" style="text-align:right">
                                    <xsl:if test="ends-with($next, '.html')">
                                        <h1>
                                            <a>
                                                <xsl:attribute name="href">
                                                    <xsl:value-of select="$next"/>
                                                </xsl:attribute>
                                                <i class="bi bi-chevron-right" title="weiter"/>
                                            </a>
                                        </h1>
                                    </xsl:if>
                                </div>
                            </div>
                            <div id="container-resize" class="row transcript active">
                                <div id="text-resize" lang="de"
                                    class="col-md-6 col-lg-6 col-sm-12 text yes-index nothingtoseehere" />
                                <div id="text-resize" lang="de"
                                    class="col-md-6 col-lg-6 col-sm-12 d-flex justify-content-center facsimiles yes-index">
                                    <div id="seadragon-viewer" />
                                </div>
                                <div id="text-resize" lang="de"
                                    class="col-md-6 col-lg-6 col-sm-12 text yes-index nothingtoseehere">
                                    <div id="section">
                                        <xsl:for-each select="//tei:body/tei:div" >
                                            <div class="card-body non_mimetic_lbs" >
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
                <script src="https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/openseadragon.min.js"/>
                <script type="text/javascript" src="js/osd_nofrills.js"></script>
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
        <span class="hline"><xsl:value-of select="$mybreak" disable-output-escaping="yes"/></span>
        <!-- needed for scrolling / numbering -->
        <span class="anchor-pb"/>
        <!-- determine img src -->
        <xsl:variable name="pbId"><xsl:value-of select="replace(data(@facs), '#', '')"/></xsl:variable>
        <xsl:variable name="surfaceNode" as="node()"><xsl:value-of select="//tei:graphic[@xml:id = $pbId]"/></xsl:variable>
        <xsl:variable name="facsUrl"><xsl:value-of select="data(//tei:surface[@xml:id = $pbId]/tei:graphic/@url)"/></xsl:variable>
        <xsl:variable name="page_number"><xsl:number level="any"/></xsl:variable>
        <span class="pb" source="{$facsUrl}" n="{$page_number}"
            style="--page_before: '{($page_number - 1)}'; --beginning_page: '{$page_number}';"> </span>
        <span class="pb_marker" n="{$page_number}"/>
    </xsl:template>
    <xsl:template match="tei:ab">
        <xsl:variable select="./@class" name="currentclass" />
        <p>
            <xsl:attribute name="class">
                <xsl:value-of select="$currentclass" />
                <xsl:text>yes-index</xsl:text>
            </xsl:attribute>
             <xsl:apply-templates/>
        </p>
    </xsl:template>
    <xsl:template match="self::text()">
        <xsl:variable name="classtype" select="tokenize(ancestor::tei:ab[1]/@type, '_')[1]" />
        <xsl:if test="string-length(normalize-space(self::text())) > 0">
            <!-- <xsl:choose>
                <xsl:when test="$classtype = 'text'">
                    <xsl:value-of select="." />
                    <xsl:value-of select="$mybreak" disable-output-escaping="yes"/>
                </xsl:when>
                <xsl:otherwise> -->
                    <span>
                        <xsl:attribute name="class">
                            <xsl:choose>
                                <xsl:when test="$classtype='rubrik2'">
                                    <xsl:text>rubrik</xsl:text>
                                </xsl:when>
                                <xsl:otherwise>
                                    <xsl:value-of select="$classtype" />
                                </xsl:otherwise>
                            </xsl:choose>
                        </xsl:attribute>
                        <xsl:attribute name="id">
                            <xsl:value-of select="generate-id()" />
                        </xsl:attribute>
                        <xsl:value-of select="normalize-space(.)" />
                    </span>
                    <xsl:if test="$classtype != 'initiale'">
                        <xsl:value-of select="$mybreak" disable-output-escaping="yes"/>
                    </xsl:if>
                <!-- </xsl:otherwise>
            </xsl:choose> -->
        </xsl:if>
    </xsl:template>
    <xsl:template match="tei:a[contains(@class, 'navigation_')]">
        <a class="{@class}" id="{@xml:id}">
            <xsl:apply-templates/>
        </a>
    </xsl:template>
</xsl:stylesheet>
