<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet 
    xmlns="http://www.w3.org/1999/xhtml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema"
                                        version="2.0" exclude-result-prefixes="xsl tei xs">
    <xsl:output encoding="UTF-8" media-type="text/html" method="xhtml" version="1.0" indent="yes" omit-xml-declaration="yes"/>
    
    <xsl:import href="./partials/html_navbar.xsl"/>
    <xsl:import href="./partials/html_head.xsl"/>
    <xsl:import href="partials/html_footer.xsl"/>
    <xsl:import href="./partials/meta_tags.xsl"/>
    
    <xsl:template match="/">
        <xsl:variable name="doc_title" select="'Edierte Dokumente'"/>
        <xsl:text disable-output-escaping='yes'>&lt;!DOCTYPE html&gt;</xsl:text>
        <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <xsl:call-template name="html_head">
                    <xsl:with-param name="html_title" select="$doc_title"></xsl:with-param>
                </xsl:call-template>
                <link href="https://unpkg.com/tabulator-tables@5.5.2/dist/css/tabulator.min.css" rel="stylesheet"/>
                <link href="css/tabulator-custom.css" rel="stylesheet"/>
                <xsl:call-template name="meta-tags">
                    <xsl:with-param name="title" select="$doc_title"></xsl:with-param>
                    <xsl:with-param name="description" select="'Choralhandschriften der Zentralbibliothek der Wiener Franziskanerprovinz Graz'"></xsl:with-param>
                </xsl:call-template>
            </head>
            
            <body class="page">
                <div class="hfeed site" id="page">
                    <xsl:call-template name="nav_bar"/>
                    
                    <div class="container-fluid">
                        <div class="card">
                            <div class="card-header">
                                <h1><xsl:value-of select="$doc_title"/></h1>
                            </div>
                            <div class="card-body">
                                <table id="tocTable">
                                    <thead>
                                        <tr>
                                            <th scope="col">Titel</th>
                                            <th scope="col">Entstehung (tpq)</th>
                                            <th scope="col">beteiligte Personen</th>
                                            <th scope="col">Dokumententyp</th>
                                            <th scope="col">Materialtyp</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <xsl:for-each select="collection('../data/editions')//tei:TEI">
                                            <xsl:variable name="full_path">
                                                <xsl:value-of select="document-uri(/)"/>
                                            </xsl:variable>
                                            <tr>
                                                <td>                                        
                                                    <a>
                                                        <xsl:attribute name="href">                                                
                                                            <xsl:value-of select="replace(tokenize($full_path, '/')[last()], '.xml', '.html')"/>
                                                        </xsl:attribute>
                                                        <xsl:value-of select=".//tei:title[@type='main'][1]/text()"/>
                                                    </a>
                                                </td>
                                                <!--
                                                if necessary data could here be alterd to provide a 
                                                sorter val for the date and an human readable value 
                                                (preventing further dependencies for tabulator script)

                                                <xsl:variable name="iso_date_taq" select="normalize-space(//tei:profileDesc/tei:creation/tei:date/@notBefore-iso[1])"/>
                                                <td isodate="{translate($iso_date_taq, '-', '')}">
                                                    <xsl:value-of select="format-date(xs:date($iso_date_taq), '[D]. [M]. [Y]')" />
                                                </td>
                                                -->
                                                <td>
                                                    <xsl:value-of select="normalize-space(//tei:profileDesc/tei:creation/tei:date/@notBefore-iso[1])"/>
                                                </td>
                                                <td>                                        
                                                    <xsl:value-of select="string-join((//tei:msDesc/tei:msContents/tei:msItem/tei:author/text()), ' / ')"/>
                                                </td>
                                                <td>                                        
                                                    <xsl:value-of select="//tei:sourceDesc/tei:msDesc/tei:physDesc/tei:objectDesc/@form[1]"/>
                                                </td>
                                                <td>                                        
                                                    <xsl:value-of select="//tei:text/@type"/>
                                                </td>
                                            </tr>
                                        </xsl:for-each>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    <xsl:call-template name="html_footer"/>
                    <script type="text/javascript" src="https://unpkg.com/tabulator-tables@5.5.2/dist/js/tabulator.min.js"></script>
                    <script type="text/javascript" src="js/tabulatorInit.js"></script>
                </div>
            </body>
        </html>
    </xsl:template>
    <xsl:template match="tei:div//tei:head">
        <h2 id="{generate-id()}"><xsl:apply-templates/></h2>
    </xsl:template>
    
    <xsl:template match="tei:p">
        <p id="{generate-id()}"><xsl:apply-templates/></p>
    </xsl:template>
    
    <xsl:template match="tei:list">
        <ul id="{generate-id()}"><xsl:apply-templates/></ul>
    </xsl:template>
    
    <xsl:template match="tei:item">
        <li id="{generate-id()}"><xsl:apply-templates/></li>
    </xsl:template>
    <xsl:template match="tei:ref">
        <xsl:choose>
            <xsl:when test="starts-with(data(@target), 'http')">
                <a>
                    <xsl:attribute name="href"><xsl:value-of select="@target"/></xsl:attribute>
                    <xsl:value-of select="."/>
                </a>
            </xsl:when>
            <xsl:otherwise>
                <xsl:apply-templates/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
</xsl:stylesheet>
