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
            <body class="flex-column">
                <!-- Landing page -->
                <xsl:call-template name="nav_bar"/>
                <main class="flex-grow bg">
		            <div class="row banner"/>
                    <div class="body-contents">
                        <div class="row title align-center">
                            <h1><xsl:value-of select="$project_title"/></h1>
                            <h3>Die Zentralbibliothek des Franziskanerklosters Graz verwahrt zahlreiche Choralquellen vom Beginn des 14. Jahrhunderts weg bis zum 19. Jahrhundert. In der Forschung wurden diese Handschriften und Drucke bislang wenig beachtet. Knapp ein Drittel der 56 Quellen stammt aus dem 14., 15. und 16. Jahrhundert, zwei Drittel sind aus dem 17. und 18. Jahrhundert und bilden somit einen starken, repräsentativen Bestand zur Beschäftigung mit dem heute wenig beachteten Barockchoral.</h3>
                             <div class="button"><a href="about.html"><button class="btn btn-round">Über das Projekt</button></a></div>
                        </div>
                        <hr class="hr-custom"/>
                        <div class="row subcontents align-center">
                            <div class="column-left overflow-hidden">
                                <img class="img-fluid" src="images/image01.png" alt="Illumination einer Choralhandschrift" />
                            </div>
                            <div class="column-right overflow-hidden">
                                <h2>Die Quellen</h2>
                                <p class="p-cover">Die Grazer Zentralbibliothek verwahrt zahlreiche Choralquellen vom Beginn des 14. Jahrhunderts weg bis zum 19. Jahrhundert. Knapp ein Drittel der Quellen stammt aus dem 14., 15. und 16. Jahrhundert, zwei Drittel sind aus dem 17. und 18. Jahrhundert und bilden somit einen starken, repräsentativen Bestand zur Beschäftigung mit dem heute wenig beachteten Barockchoral.</p>
                                <div class="button overflow-hidden">
                                    <a href="books.html"><button class="btn btn-round btn-index">Weiter lesen</button></a>
                                    &#160;
                                    <a href="toc.html"><button class="btn btn-round btn-index">Die Quellen</button></a>
                                </div>
                            </div>
                        </div>
                        <hr class="hr-custom"/>
                        <div class="subcontents align-center">
                            <img class="img-fluid" src="images/image02.png" alt="Fragment des Titelblatts eines Choraldruckes" />
                            <div class="button overflow-hidden">
                                <a href="listplace.html"><button class="btn btn-round btn-index">Orte</button></a>
                                &#160;
                                <a href="listperson.html"><button class="btn btn-round btn-index">Drucker</button></a>
                            </div>
                        </div>
                    </div>
                </main>
                <xsl:call-template name="html_footer"/>
            </body>
        </html>
    </xsl:template>
    <xsl:template match="tei:div//tei:head">
        <h1 id="{generate-id()}">
            <xsl:apply-templates/>
        </h1>
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
