<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="xs xsl tei" version="2.0">
    <xsl:output encoding="UTF-8" media-type="text/html" method="xhtml" version="1.0" indent="yes" omit-xml-declaration="yes"/>

    <doc xmlns="http://www.oxygenxml.com/ns/doc/xsl">
        <desc>
            <h1>Widget annotation options.</h1>
            <p>Contact person: daniel.stoxreiter@oeaw.ac.at</p>
            <p>Applied with call-templates in html:body.</p>
            <p>Custom template to create interactive options for text annoations.</p>
        </desc>
    </doc>

    <xsl:template name="get_article_nav">
        <xsl:for-each select=".//tei:div[@type='article']">
            <li class="article_ref">
                <a class="dropdown-item">
                    <xsl:attribute name="href">
                        <xsl:value-of select="concat('#', (.//tei:a[contains(@class, 'navigation')]/@xml:id)[1])"/>
                    </xsl:attribute>
                    <xsl:value-of select="./tei:head[1]/normalize-space()"/>
                </a>
            </li>
        </xsl:for-each>
    </xsl:template>

    <xsl:template name="chapters">
        <div id="chapter-navBarNavDropdown" class="navBarNavDropdown dropstart">
            <!-- Your menu goes here -->
            <a title="Kapitel" href="#" data-bs-toggle="dropdown" data-bs-auto-close="true" aria-expanded="false" role="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" class="bi bi-book" viewBox="0 0 16 16">
                    <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
                </svg>
            </a>
            <ul class="dropdown-menu" id="chapter_navigation">
                <!--<xsl:variable name="section_divs" select=".//tei:body//tei:div[contains(@type, 'section')]"/>-->
                <xsl:variable name="section_divs" select=".//tei:body//tei:div[contains(@type, 'section')]"/>
                <xsl:variable name="section_divs_exist" select="if ($section_divs) then 'true' else 'false'"/>
                <xsl:choose>
                    <xsl:when test="$section_divs_exist = 'true'">
                        <xsl:for-each select="$section_divs">
                            <li class="section_ref">
                                <a class="dropdown-item">
                                    <xsl:attribute name="href">
                                        <xsl:value-of select="concat('#', (.//tei:a[contains(@class, 'navigation')]/@xml:id)[1])"/>
                                    </xsl:attribute>
                                    <xsl:value-of select="./tei:head[1]/normalize-space()"/>
                                </a>
                                <ul class="dropown-menu dropdown-submenu">
                                    <xsl:call-template name="get_article_nav"/>
                                </ul>
                            </li>
                        </xsl:for-each>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:call-template name="get_article_nav"/>
                    </xsl:otherwise>
                </xsl:choose>
            </ul>
        </div>
        <!--<script type="text/javascript">
            $('#chapter-navBarNavDropdown .dropdown-menu .nav-item').click(function(e) {
                e.stopPropagation();
            });
        </script>-->
    </xsl:template>
</xsl:stylesheet>