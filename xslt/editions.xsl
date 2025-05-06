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
        <!-- <xsl:text>.xml</xsl:text> -->
    </xsl:variable>
    <xsl:variable name="doc_title">
        <xsl:value-of select="concat(.//tei:titleStmt/tei:title[@xml:lang='de']/text(), ' (', .//tei:titleStmt/tei:title[@type='desc']/text(), ')')"/>
    </xsl:variable>
    <xsl:variable name="link">
        <xsl:value-of select="replace($teiSource, '.xml', '.html')"/>
    </xsl:variable>
    <xsl:template match="/">
        <xsl:text disable-output-escaping="yes">&lt;!DOCTYPE html&gt;</xsl:text>
        <html class="page"  lang="de">
            <head>
                <xsl:call-template name="html_head">
                    <xsl:with-param name="html_title" select="$doc_title"/>
                </xsl:call-template>
            </head>
            <body class="d-flex flex-column">
             <xsl:call-template name="nav_bar"/>
                <main class="hfeed site flex-grow" id="page">
                    <div class="edition_container ">
                        <div class="offcanvas offcanvas-start" tabindex="-1"
                            id="offcanvasNavigation" aria-labelledby="offcanvasNavigationLabel"
                            data-bs-scroll="true" data-bs-backdrop="false">
                            <div class="offcanvas-header" />
                            <div class="offcanvas-body" />
                        </div>
                        <div class="offcanvas offcanvas-end" tabindex="0" id="offcanvasOptions"
                            aria-labelledby="offcanvasOptionsLabel" data-bs-scroll="true"
                            data-bs-backdrop="false">
                        </div>
                        
                        <div class="row" id="edition_metadata">
                            <xsl:variable name="doc_type"
                                select="//tei:sourceDesc/tei:msDesc/tei:physDesc/tei:objectDesc/@form[1]"/>
                            <h2 align="center">
                                <xsl:value-of select="$doc_title"/>
                            </h2>
                            <div class="row" id="fa_links">
                                <div class="col-4"  style="text-align:right">
                                    <xsl:if test="ends-with($prev,'.html')">
                                        <h3>
                                            <a>
                                                <xsl:attribute name="href">
                                                    <xsl:value-of select="$prev"/>
                                                </xsl:attribute>
                                                <i class="fa-solid fa-caret-left left" title="zurück"/>
                                            </a>
                                        </h3>
                                    </xsl:if>
                                </div>
                                <div class="col-4 docinfo" style="text-align:center">
                                    <h3 align="center">
                                        <a href="{$teiSource}">
                                            <i class="fa-solid fa-file-code center" title="TEI/XML"/>
                                        </a>
                                    </h3>
                                </div>
                                <div class="col-4" style="text-align:left">
                                    <xsl:if test="ends-with($next, '.html')">
                                        <h3>
                                            <a>
                                                <xsl:attribute name="href">
                                                    <xsl:value-of select="$next"/>
                                                </xsl:attribute>
                                                <i class="fa-solid fa-caret-right right" title="weiter"/>
                                            </a>
                                        </h3>
                                    </xsl:if>
                                </div>
                            </div> 
                        </div>
                        <!--    THIS IS THE MAIN DIV -->                     
                        <div class="wp-transcript">
                            <div id="container-resize" class="row transcript active">
                                <div id="text-resize" class="col-md-4 col-lg-4 col-sm-1 text" >
                                </div>
                                <div id="img-resize" class="col-md-4 col-lg-4 col-sm-12 facsimiles" >   <!-- OSD container (facsimiles).  Maybe 6 (1/2 of the total)-->
                                    <div id="viewer">
                                        <div id="container_facs_1" class="osd-container"/>
                                    </div>
                                </div>
                                <div id="text-resize" lang="de" class="col-md-4 col-lg-4 col-sm-11 text yes-index"> <!--- Maybe 6 (1/2 of the total) -->
                                    <div id="transcript">
                                        <xsl:apply-templates/> <!-- Text transcription -->
                                    </div>
                                </div>
                            </div>
                            <!-- create list* elements for entities bs-modal -->
                        </div>
                    </div>
                </main>
                <xsl:call-template name="html_footer"/>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/openseadragon.min.js"/>
                <script type="text/javascript" src="js/osd_scroll.js"></script>
                <script src="https://unpkg.com/de-micro-editor@0.3.4/dist/de-editor.min.js"></script>
                <script type="text/javascript" src="js/run.js"></script>
                <script type="text/javascript" src="js/offcanvastoggler.js"/>
            </body>
        </html>
    </xsl:template>
    <xsl:template match="tei:teiHeader" />
    <xsl:template match="tei:facsimile" />
<xsl:template match="tei:pb">
    <xsl:variable name="pbId"><xsl:value-of select="replace(data(@facs), '#', '')"/></xsl:variable>
    <xsl:variable name="facsUrl"><xsl:value-of select="data(//tei:surface[@xml:id = $pbId]/tei:graphic/@url)"/></xsl:variable>
    <xsl:variable name="page_number"><xsl:number level="any"/></xsl:variable>
    <p class="pb" source="{$facsUrl}" n="{$page_number}" id="{$pbId}" />
</xsl:template>
<xsl:template match="tei:ab">
        <xsl:variable select="./@class" name="currentclass" />
        <xsl:variable name="pbId"><xsl:value-of select="replace(data(@facs), '#', '')"/></xsl:variable>
        <p>
            <xsl:attribute name="class">
                <xsl:value-of select="$currentclass" />
                <xsl:text>yes-index</xsl:text>
            </xsl:attribute>
            <xsl:attribute name="id">
                <xsl:value-of select="$pbId" />
            </xsl:attribute>
             <xsl:apply-templates/>
        </p>
</xsl:template>
<xsl:template match="tei:lb">
        <xsl:variable select="./@class" name="currentclass" />
        <xsl:variable name="pbId"><xsl:value-of select="replace(data(@facs), '#', '')"/></xsl:variable>
        <br>
            <xsl:attribute name="class">
                <xsl:value-of select="$currentclass" />
            </xsl:attribute>
            <xsl:attribute name="id">
                <xsl:value-of select="$pbId" />
            </xsl:attribute>
             <xsl:apply-templates/>
        </br>
</xsl:template>
   <!-- <xsl:template match="tei:rs">
        <xsl:variable name="ppid">
            <xsl:value-of select="./@ref"/>
        </xsl:variable>
        <span id="{$ppid}" class="person">
		<xsl:apply-templates/></span>
    </xsl:template>  -->
</xsl:stylesheet>
