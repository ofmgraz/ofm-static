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
                <main class="flex-grow-1">
                    <div class="container">
                        <h1 style="text-align:center;">
                            <xsl:value-of select="$project_short_title"/>
                        </h1>
                        
                        <div id="carouselExampleControls" class="carousel slide"
                            data-ride="carousel" style="margin:20px">
                            <div class="carousel-inner">
                                <div class="carousel-item active">
                                    <img class="d-block w-100" src="img/ofmgraz_01.jpg" alt="First slide" />  
                                </div>
                                <!-- <div class="carousel-item">
                                    <img class="d-block w-100" src="img/ofmgraz_02.jpg" alt="Second slide" />
                                </div> -->
                                <div class="row">
                                    <div class="col-md-6">
                                        <h1 style="text-align:center">
                                            <a class="btn btn-main btn-outline-primary btn-lg"
                                                href="about.html" role="button">Über die Edition</a>
                                        </h1>
                                    </div>
                                    <div class="col-md-6">
                                        <h1 style="text-align:center">
                                            <a class="btn btn-main btn-outline-primary btn-lg"
                                                href="toc.html" role="button">Alle Dokumente</a>
                                        </h1>
                                    </div>
                                </div>
                            </div>
                           <!--  <a class="carousel-control-prev" href="#carouselExampleControls"
                                role="button" data-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"/>
                                <span class="sr-only">Previous</span>
                            </a>
                            <a class="carousel-control-next" href="#carouselExampleControls"
                                role="button" data-slide="next">
                                <span class="carousel-control-next-icon" aria-hidden="true"/>
                                <span class="sr-only">Next</span>
                            </a> -->
                        </div>
                        <h2 style="text-align:center;">
                            <xsl:value-of select="$project_title"/>
                        </h2>
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
