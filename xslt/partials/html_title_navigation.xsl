<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:local="http://dse-static.foo.bar"
    xmlns:mam="whatever" version="2.0" exclude-result-prefixes="xsl tei xs">
    <xsl:output encoding="UTF-8" media-type="text/html" method="xhtml" version="1.0" indent="yes"
        omit-xml-declaration="yes"/>
    
    <xsl:variable name="prev">
        <xsl:value-of select="replace(tokenize(data(tei:TEI/@prev), '/')[last()], '.xml', '.html')"
        />
    </xsl:variable>
    <xsl:variable name="next">
        <xsl:value-of select="replace(tokenize(data(tei:TEI/@next), '/')[last()], '.xml', '.html')"
        />
    </xsl:variable>
    <xsl:template name="header-nav">
        <xsl:param name="doc_title"/>
        <xsl:variable name="correspContext" as="node()?"
            select=".//tei:correspContext[1]"/>
        <div class="row">
            <div class="col-md-2">
                <xsl:if test="$correspContext/tei:ref/@subtype = 'previous_letter'">
                    <h1>
                        <i class="bi bi-chevron-left nav-link float-start" href="#"
                            id="navbarDropdownLeft" role="button" data-bs-toggle="dropdown"
                            aria-expanded="false"/>
                        <ul class="dropdown-menu unstyled" aria-labelledby="navbarDropdown">
                            <xsl:if
                                test="$correspContext/tei:ref[@type = 'withinCollection' and @subtype = 'previous_letter'][1]">
                                <span class="dropdown-item-text">Vorheriger Brief </span>
                                <xsl:for-each
                                    select="$correspContext/tei:ref[@type = 'withinCollection' and @subtype = 'previous_letter']">
                                    <xsl:call-template name="mam:nav-li-item">
                                        <xsl:with-param name="eintrag" select="."/>
                                        <xsl:with-param name="direction" select="'prev-doc'"/>
                                    </xsl:call-template>
                                </xsl:for-each>
                            </xsl:if>
                            <xsl:if
                                test="$correspContext/tei:ref[@type = 'withinCorrespondence' and @subtype = 'previous_letter'][1]">
                                <span class="dropdown-item-text">… in der Korrespondenz</span>
                                <xsl:for-each
                                    select="$correspContext/tei:ref[@type = 'withinCorrespondence' and @subtype = 'previous_letter']">
                                    <xsl:call-template name="mam:nav-li-item">
                                        <xsl:with-param name="eintrag" select="."/>
                                        <xsl:with-param name="direction" select="'prev-doc2'"/>
                                    </xsl:call-template>
                                </xsl:for-each>
                            </xsl:if>
                        </ul>
                    </h1>
                </xsl:if>
            </div>
            <div class="col-md-8">
                <h1 align="center">
                    <xsl:value-of select="$doc_title"/>
                </h1>
                <h3 align="center">
                    <a href="{$teiSource}">
                        <i class="bi bi-download" title="show TEI source"/>
                    </a>
                </h3>
                <p class="text-center">
                    <small><xsl:value-of select="//tei:msDesc/tei:msIdentifier/tei:repository" /><xsl:text> </xsl:text>
                        <xsl:value-of select="//tei:msDesc/tei:msIdentifier/tei:settlement" />,                         
                        <xsl:value-of select="//tei:msDesc/tei:msIdentifier/tei:idno" />
                        
                    </small>
                </p>
            </div>
            <div class="col-md-2 text-end">
                <xsl:if test="$correspContext/tei:ref/@subtype = 'next_letter'">
                    <h1>
                        <i class="bi bi-chevron-right nav-link float-end" href="#"
                            id="navbarDropdownLeft" role="button" data-bs-toggle="dropdown"
                            aria-expanded="false"/>
                        <ul class="dropdown-menu dropdown-menu-right unstyled" aria-labelledby="navbarDropdown">
                            <xsl:if
                                test="$correspContext/tei:ref[@type = 'withinCollection' and @subtype = 'next_letter'][1]">
                                <span class="dropdown-item-text">Nächster Brief </span>
                                <xsl:for-each
                                    select="$correspContext/tei:ref[@type = 'withinCollection' and @subtype = 'next_letter']">
                                    <xsl:call-template name="mam:nav-li-item">
                                        <xsl:with-param name="eintrag" select="."/>
                                        <xsl:with-param name="direction" select="'next-doc'"/>
                                    </xsl:call-template>
                                </xsl:for-each>
                            </xsl:if>
                            <xsl:if
                                test="$correspContext/tei:ref[@type = 'withinCorrespondence' and @subtype = 'next_letter'][1]">
                                <span class="dropdown-item-text">… in der Korrespondenz</span>
                                <xsl:for-each
                                    select="$correspContext/tei:ref[@type = 'withinCorrespondence' and @subtype = 'next_letter']">
                                    <xsl:call-template name="mam:nav-li-item">
                                        <xsl:with-param name="eintrag" select="."/>
                                        <xsl:with-param name="direction" select="'next-doc2'"/>
                                    </xsl:call-template>
                                </xsl:for-each>
                            </xsl:if>
                        </ul>
                    </h1>
                </xsl:if>
            </div>
        </div>
    </xsl:template>
    
    <xsl:template name="mam:nav-li-item">
        <xsl:param name="eintrag" as="node()"/>
        <xsl:param name="direction"/>
        <xsl:element name="li">
            <xsl:element name="a">
                <xsl:attribute name="id">
                    <xsl:value-of select="$direction"/>
                </xsl:attribute>
                <xsl:attribute name="class">
                    <xsl:text>dropdown-item</xsl:text>
                </xsl:attribute>
                <xsl:attribute name="href">
                    <xsl:value-of select="concat(substring-before($eintrag/@target, '.'), '.html')"/>
                </xsl:attribute>
                <xsl:choose>
                    <xsl:when test="contains($eintrag/@subtype, 'next')">
                        <i class="bi bi-chevron-right"/>&#160; <!--
                 --></xsl:when>
                    <xsl:when test="contains($eintrag/@subtype, 'previous')">
                        <i class="bi bi-chevron-left"/>&#160; <!--
                 --></xsl:when>
                </xsl:choose>
                <xsl:value-of select="$eintrag"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
</xsl:stylesheet>