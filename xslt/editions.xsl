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
    <xsl:import href="./partials/aot-options.xsl"/>



    <xsl:variable name="prev">
        <xsl:value-of select="replace(tokenize(data(tei:TEI/@prev), '/')[last()], '.xml', '.html')"
        />
    </xsl:variable>
    <xsl:variable name="next">
        <xsl:value-of select="replace(tokenize(data(tei:TEI/@next), '/')[last()], '.xml', '.html')"
        />
    </xsl:variable>
    <xsl:variable name="teiSource">
        <xsl:value-of select="data(tei:TEI/@xml:id)"/>
        <xsl:text>.xml</xsl:text>
    </xsl:variable>
    <xsl:variable name="link">
        <xsl:value-of select="replace($teiSource, '.xml', '.html')"/>
    </xsl:variable>
    <xsl:variable name="doc_title">
        <xsl:value-of select=".//tei:titleStmt/tei:title[@type = 'main'][1]/text()"/>
    </xsl:variable>



    <xsl:template match="/">
        <html class="h-100">
            <head>
                <xsl:call-template name="html_head">
                    <xsl:with-param name="html_title" select="$doc_title"/>
                </xsl:call-template>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/openseadragon.min.js"/>
                <script src="js/osd_single.js"/>
            </head>
            <body class="d-flex flex-column h-100">
                <xsl:call-template name="nav_bar"/>
                <main class="flex-shrink-0">
                    <div class="container">
                        <div class="regest">
                            <h4>
                                <xsl:for-each select=".//tei:ab[@type = 'abstract-terms']/tei:term">
                                    <span class="badge badge-primary p-1 m-1">
                                        <xsl:value-of select="./text()"/>
                                    </span>
                                </xsl:for-each>
                            </h4>
                            <div class="regest-text">
                                <xsl:apply-templates select=".//tei:abstract[@n = 'regest']"/>
                            </div>
                        </div>
                        <div class="col-md-8 col-lg-8 col-sm-12">
                            <h1 align="center">
                                <xsl:value-of select="$doc_title"/>
                            </h1>
                            <h1 class="text-center pb-4 pt-3">
                                <a href="{$teiSource}">
                                    <i class="bi bi-download" title="TEI/XML"/>
                                </a>
                            </h1>
                            <h2 style="text-align:center;">
                                <xsl:value-of
                                    select="//tei:msIdentifier/tei:repository/tei:placeName[1]"/>
                            </h2>
                            
                        </div>
                        <xsl:for-each select=".//tei:div[@type = 'page']">
                            <xsl:variable name="pbFacs">
                                <xsl:value-of select="replace(data(./tei:pb/@xml:id), '.jpg', '')"/>
                            </xsl:variable>
                            <xsl:variable name="pbFolio" as="node()">
                                <xsl:value-of select="data(./tei:pb/@n)"/>
                            </xsl:variable>
                            <xsl:variable name="openSeadragonId">
                                <xsl:value-of
                                    select="concat('os-id-', substring((./tei:pb/@facs)[1], 7))"/>
                            </xsl:variable>
                            <xsl:variable name="rotation">
                                <xsl:value-of select="data(./tei:pb/@rend)"/>
                            </xsl:variable>
                            <xsl:variable name="facs-url" select="data((./tei:pb/@source)[1])"/>
                            <div class="row">
                                <div class="col-md-12">
                                    <div class="float-end">
                                        <h5>
                                            <xsl:value-of select="$pbFolio"/>
                                        </h5>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div id="{$openSeadragonId}">
                                        <img id="{$openSeadragonId}-img"
                                            src="{normalize-space($facs-url)}"
                                            onload="loadImage('{$openSeadragonId}', '{$rotation}')"/>
                                        <!-- cosy spot for OSD viewer  -->
                                    </div>
                                </div>
                                <div class="col-md-6 editionstext">
                                    <xsl:apply-templates/>
                                </div>
                            </div>
                            <!-- <div class="row">
                                <div class="col-md-2 col-lg-2 col-sm-12">
                                    <xsl:if test="ends-with($prev, '.html')">
                                        <h1>
                                            <a>
                                                <xsl:attribute name="href">
                                                  <xsl:value-of select="$prev"/>
                                                </xsl:attribute>
                                                <i class="bi bi-chevron-left" title="zurück"/>
                                            </a>
                                        </h1>
                                    </xsl:if>
                                </div> -->
                            <div class="row">
                                <div class="col-md-12">
                                    <hr/>
                                </div>
                            </div>

                        </xsl:for-each>

                        

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


                        <p style="text-align:center;">
                            <xsl:for-each select=".//tei:note[not(./tei:p)]">
                                <div class="footnotes" id="{local:makeId(.)}">
                                    <xsl:element name="a">
                                        <xsl:attribute name="name">
                                            <xsl:text>fn</xsl:text>
                                            <xsl:number level="any" format="1" count="tei:note"/>
                                        </xsl:attribute>
                                        <a>
                                            <xsl:attribute name="href">
                                                <xsl:text>#fna_</xsl:text>
                                                <xsl:number level="any" format="1" count="tei:note"
                                                />
                                            </xsl:attribute>
                                            <span
                                                style="font-size:7pt;vertical-align:super; margin-right: 0.4em">
                                                <xsl:number level="any" format="1" count="tei:note"
                                                />
                                            </span>
                                        </a>
                                    </xsl:element>
                                    <xsl:apply-templates/>
                                </div>
                            </xsl:for-each>
                        </p>
                        <xsl:for-each select="//tei:back">
                            <div class="tei-back">
                                <xsl:apply-templates/>
                            </div>
                        </xsl:for-each>
                    </div>
                </main>
                <xsl:call-template name="html_footer"/>
            </body>
        </html>
    </xsl:template>

    <xsl:template match="tei:p">
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
    </xsl:template>
    <xsl:template match="tei:div">
        <div id="{local:makeId(.)}">
            <xsl:apply-templates/>
        </div>
    </xsl:template>
    
    <xsl:template match="tei:lb">
        <!-- 
        <xsl:variable name="idx" select="format-number(number(replace(./@n, 'N', '')), '#')"/> -->
        <xsl:variable name="idx" select="number(001)" />
            <xsl:if test="ancestor::tei:ab">
                <a>       
                    <xsl:variable name="para" as="xs:int">
                        <xsl:number level="any" from="tei:body" count="tei:p"/>
                    </xsl:variable>
                    <xsl:variable name="lines" as="xs:int">
                        <xsl:number level="any" from="tei:body"/>
                    </xsl:variable>
                    <xsl:variable name="pID">
                        <xsl:value-of select="data(substring-after(parent::tei:p/@facs, '#'))"/>
                    </xsl:variable>
                    <xsl:variable name="surface"
                        select="//tei:surface/tei:zone[@xml:id = $pID]/parent::tei:surface"/>
                    <xsl:variable name="zones"
                        select="//tei:surface/tei:zone[@xml:id = $pID]/tei:zone[$idx]"/>
                    <xsl:attribute name="href">
                        <xsl:value-of select="parent::tei:p/@facs"/>
                        <xsl:text>__p</xsl:text>
                        <xsl:value-of select="$para"/>
                        <xsl:text>__lb</xsl:text>
                        <xsl:value-of select="$lines"/>
                    </xsl:attribute>
                    <xsl:attribute name="name">
                        <xsl:value-of select="parent::tei:p/@facs"/>
                        <xsl:text>__p</xsl:text>
                        <xsl:value-of select="$para"/>
                        <xsl:text>__lb</xsl:text>
                        <xsl:value-of select="$lines"/>
                    </xsl:attribute>
                    <xsl:attribute name="id">
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
                    </xsl:attribute>
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
            </xsl:if>
    </xsl:template>
</xsl:stylesheet>
