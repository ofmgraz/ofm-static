<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:local="http://dse-static.foo.bar"
    version="2.0" exclude-result-prefixes="xsl tei xs local">

    <xsl:output encoding="UTF-8" media-type="text/html" method="html" version="5.0" indent="yes"
        omit-xml-declaration="yes"/>


    <xsl:import href="./partials/html_head.xsl"/>
    <xsl:import href="./partials/html_navbar.xsl"/>
    <xsl:import href="./partials/html_footer.xsl"/>

    <xsl:template match="/">
        <xsl:variable name="doc_title">
            <xsl:value-of select='"OFM"'/>
        </xsl:variable>


        <html class="page" lang="de">

            <head>
                <xsl:call-template name="html_head">
                    <xsl:with-param name="html_title" select="$doc_title"/>
                </xsl:call-template>
            </head>
            <body class="d-flex flex-column">
                <!-- Landing page -->
                <xsl:call-template name="nav_bar"/>
                <main class="flex-grow-1 flex-shrink-1 bg">
                    <div class="row pad">
                        <br/>
                        <br/>
                    </div>
		            <div class="row banner"/>
                    <div class="row title">
                        <div class="col-md-2 col-lg-2 col-sm-12 pad"/>
                        <div class="col-md-8 col-lg-8 col-sm-12">
                            <h2 style="text-align:center;">
                                <xsl:value-of select="$project_title"/>
                            </h2>
                            <h3 style="text-align:center;">Die Zentralbibliothek des Franziskanerklosters Graz verwahrt zahlreiche Choralquellen vom Beginn des 14. Jahrhunderts weg bis zum 19. Jahrhundert. In der Forschung wurden diese Handschriften und Drucke bislang wenig beachtet. Knapp ein Drittel der 56 Quellen stammt aus dem 14., 15. und 16. Jahrhundert, zwei Drittel sind aus dem 17. und 18. Jahrhundert und bilden somit einen starken, repräsentativen Bestand zur Beschäftigung mit dem heute wenig beachteten Barockchoral.</h3>
                        </div>
                    </div>
                    <div class="subcontents">
                        <hr class="hr-custom"/>
                        <div class="row main-content">
                            <div class="column-picture col-lg-3 col-md-4 col-sm-3 overflow-hidden">Picture</div>
                            <div class="column-text col-lg-3 col-md-4 col-sm-3 overflow-hidden"><h3>Quellen</h3><p>Text.</p>
                                <div class="text-right">
                                    <a href="toc.html"><button class="btn btn-round" style="background-color: #A63437; color: white;">Weiter</button></a>
                                </div>
                            </div>
                        </div>
                        <hr class="hr-custom"/>
                        <div class="registers">
                            <h3>Registers</h3>
                            <div class="row main-content">
                                <div class="column-text col-lg-3 col-md-4 col-sm-3 overflow-hidden">Places</div>
                                <div class="column-text col-lg-3 col-md-4 col-sm-3 overflow-hidden"><h3>Printers</h3><p>Text.</p></div>
                            </div>
                        </div>
                    </div>
                </main>
                <xsl:call-template name="html_footer"/>
            </body>
        </html>
    </xsl:template>
    <xsl:template match="tei:div//tei:head">
        <h2 id="{generate-id()}">
            <xsl:apply-templates/>
        </h2>
    </xsl:template>

    <xsl:template match="tei:p">
        <p id="{generate-id()}">
            <xsl:apply-templates/>
        </p>
    </xsl:template>

    <xsl:template match="tei:list">
        <ul id="{generate-id()}">
            <xsl:apply-templates/>
        </ul>
    </xsl:template>

    <xsl:template match="tei:item">
        <li id="{generate-id()}">
            <xsl:apply-templates/>
        </li>
    </xsl:template>
    <xsl:template match="tei:ref">
        <xsl:choose>
            <xsl:when test="starts-with(data(@target), 'http')">
                <a>
                    <xsl:attribute name="href">
                        <xsl:value-of select="@target"/>
                    </xsl:attribute>
                    <xsl:value-of select="."/>
                </a>
            </xsl:when>
            <xsl:otherwise>
                <xsl:apply-templates/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
</xsl:stylesheet>
