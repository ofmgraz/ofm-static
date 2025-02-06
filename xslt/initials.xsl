<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:local="http://dse-static.foo.bar" exclude-result-prefixes="xsl tei xs local"
     version="2.0">
    <xsl:output encoding="UTF-8" media-type="text/html" method="html" version="5.0" indent="yes"
        omit-xml-declaration="yes" />
    <xsl:import href="./partials/html_navbar.xsl"/>
    <xsl:import href="./partials/html_head.xsl"/>
    <xsl:import href="./partials/html_footer.xsl"/>
    <xsl:import href="./partials/osd-container.xsl"/>
    <xsl:import href="partials/tei-facsimile.xsl"/>

    <!-- Simple parameter definition -->
    <xsl:param name="shelfmark" select="'DefaultValue'" />


    <!-- Modify doc_title variable -->
    <xsl:variable name="doc_title">
        <xsl:choose>
            <xsl:when test="string-length($shelfmark) > 0">
                <xsl:value-of select="$shelfmark"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:text>Initialen</xsl:text>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:variable>

    <xsl:template match="/">
        <xsl:text disable-output-escaping="yes">&lt;!DOCTYPE html&gt;</xsl:text>
        <html class="page" lang="de">
            <head>
                <title><xsl:value-of select="$shelfmark"/></title>
                <script type="text/javascript">
                    <![CDATA[
                    function getUrlParameter(name) {
                        const urlParams = new URLSearchParams(window.location.search);
                        return urlParams.get(name) || document.title;
                    }

                    document.addEventListener("DOMContentLoaded", function () {
                        var newTitle = getUrlParameter("shelfmark");
                        document.title = newTitle;
                        window.currentXmlFile = newTitle;
                    });
                    ]]>
                </script>
                <xsl:call-template name="html_head">
                    <xsl:with-param name="html_title" select="$shelfmark"/>
                </xsl:call-template>
                 
            </head>
            <body class="d-flex flex-column">
                <xsl:call-template name="nav_bar"/>
                <main class="hfeed site flex-grow" id="page">
                    <div class="edition_container ">
                        <div class="row" id="edition_metadata">

                            <h2 align="center">
                                <xsl:text>Initialen</xsl:text>
                            </h2>
                        </div>             
                        <div class="wp-transcript">
                            <div id="container-resize" class="row transcript active">
                                <div id="text-resize" class="col-md-4 col-lg-4 col-sm-1 text" />
                                <br />
                            </div>
                            <div id="img-resize" class="col-md-4 col-lg-4 col-sm-12 facsimiles" >
                                <div id="viewer">
                                    <div id="openseadragon" class="osd-container" style="height: 75vh;"/>
                                </div>
                            </div>
                            <div id="text-resize" lang="de" class="col-md-4 col-lg-4 col-sm-11 text yes-index">
                                <div id="transcript">
                                    <xsl:apply-templates/>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <xsl:call-template name="html_footer"/>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/openseadragon.min.js"/>
                <script type="text/javascript" src="js/osd_initials.js"></script>
            </body>
        </html>
    </xsl:template>
    <xsl:template match="tei:teiHeader" />
    <xsl:template match="tei:facsimile" />
</xsl:stylesheet>