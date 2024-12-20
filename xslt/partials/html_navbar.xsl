<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="#all" version="2.0">
    <xsl:template match="/" name="nav_bar">
        <xsl:param name="edition_buttons" as="xs:boolean">
            <xsl:value-of select="false()"/>
        </xsl:param>
        <div class="wrapper-navbar sticky-top hide-reading" id="wrapper-navbar">
            <nav class="navbar navbar-expand-lg">
                <div class="container-fluid">
                    <a class="navbar-brand" href="index.html">
                        <xsl:value-of select="$project_short_title"/>
                    </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent" aria-expanded="false"
                        aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"/>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" href="#" role="button"
                                    data-bs-toggle="dropdown" aria-expanded="false">
                                    <xsl:text>Projekt</xsl:text>
                                </a>
                                <ul class="dropdown-menu">
                                    <li>
                                        <a class="dropdown-item" href="about.html">
                                            <xsl:text>Über das Projekt</xsl:text>
                                        </a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item" href="books.html">
                                             <xsl:text>Über die Quellen</xsl:text>
                                        </a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item" href="imprint.html">
                                              <xsl:text>Impressum</xsl:text>
                                        </a>
                                    </li>
                                </ul>
                            </li>

                            <li class="nav-item">
                                <a class="nav-link" href="toc.html">
                                    <xsl:text>Quellen</xsl:text>
                                </a>
                            </li>

                            <li class="nav-item dropdown disabled">
                                <a class="nav-link dropdown-toggle" href="#" role="button"
                                    data-bs-toggle="dropdown" aria-expanded="false">
                                    <xsl:text>Register</xsl:text>
                                </a>
                                <ul class="dropdown-menu">
                                    <!-- <li>
<a class="dropdown-item" href="listperson.html" data-i18n="navbar__drucker"/>
</li> -->
                                    <li>
                                        <a class="dropdown-item" href="listplace.html">
                                         <xsl:text>Orte</xsl:text>
                                        </a>
                                    </li>
                                    <li>
                                        <a class="dropdown-item" href="listperson.html">
                                            <xsl:text>Drucker</xsl:text>
                                        </a>
                                    </li>
                                    <!-- <li>
<a class="dropdown-item" href="listbibl.html" data-i18n="navbar__works"/>
</li> -->
                                </ul>
                            </li>

                            <li class="nav-item">
                                <a title="Suche" class="nav-link" href="search.html">
                                 <xsl:text>Suche</xsl:text>
                                </a>
                            </li>

                            <!-- <select name="language" id="languageSwitcher"/> -->
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    </xsl:template>
</xsl:stylesheet>
