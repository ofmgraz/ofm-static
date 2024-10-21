<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    version="2.0" exclude-result-prefixes="xsl tei xs">

    <xsl:output encoding="UTF-8" media-type="text/html" method="html" version="5.0" indent="yes"
        omit-xml-declaration="yes"/>


    <xsl:import href="./partials/html_navbar.xsl"/>
    <xsl:import href="./partials/html_head.xsl"/>
    <xsl:import href="./partials/html_footer.xsl"/>
    <xsl:import href="./partials/shared.xsl"/>
<xsl:param name="mybreak"><![CDATA[<br/>]]></xsl:param>

    <xsl:variable name="lang" select="'de'"/>
    <xsl:template match="/">
        <xsl:variable name="doc_title">
            <xsl:value-of select=".//tei:title[@type = 'main'][1]/text()"/>
        </xsl:variable>



        <html class="page">

            <head>
                <xsl:call-template name="html_head">
                    <xsl:with-param name="html_title" select="$doc_title"/>
                </xsl:call-template>
            </head>

            <body class="d-flex flex-column">
                <!-- About -->
                <xsl:call-template name="nav_bar"/>
                <main class="flex-grow">
                    <div class="container-md">
                        <h2 class="text-center">
                            <xsl:value-of select="$doc_title"/>
                        </h2>
                        <div class="container-fluid">
                            <xsl:apply-templates select=".//tei:body"/>
                        </div>
                    </div>
                </main>
                <xsl:call-template name="html_footer"/>
            </body>
        </html>
    </xsl:template>

    <!--   <xsl:template match="tei:graphic" name="img">
        <img src="{'img/'||tokenize(data(@url), '/')[last()]}" class="pb-1"/>
    </xsl:template>-->

    <xsl:template match="tei:figure">
        <xsl:variable name="imgurl">
            <xsl:value-of select="tokenize(./tei:graphic/@url, ' ')[1]"/>
        </xsl:variable>
        <img class="pb-1">
            <xsl:attribute name="src">
                <xsl:value-of select="'img/' || tokenize(data($imgurl), '/')[last()]"/>
            </xsl:attribute>
        </img>
        <xsl:if test=".//tei:desc">
            <figcaption>
                <xsl:apply-templates select=".//tei:desc"/>
            </figcaption>
        </xsl:if>
    </xsl:template>

    <xsl:template match="tei:hi[@rend]">
        <xsl:choose>
            <xsl:when test="data(@rend) eq 'italic bold'">
                <em>
                    <bold>
                        <xsl:apply-templates/>
                    </bold>
                </em>
            </xsl:when>
            <xsl:when test="data(@rend) eq 'bold'">
                <strong>
                    <xsl:apply-templates/>
                </strong>
            </xsl:when>
            <xsl:when test="data(@rend) eq 'italic'">
                <em>
                    <xsl:apply-templates/>
                </em>
            </xsl:when>
            <xsl:when test="data(@rend) eq 'underline'">
                <u>
                    <xsl:apply-templates/>
                </u>
            </xsl:when>
            <xsl:otherwise>
                <xsl:apply-templates/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="tei:list">
        <ul>
            <xsl:apply-templates/>
        </ul>
    </xsl:template>
    <xsl:template match="tei:item">
        <li>
            <xsl:apply-templates/>
        </li>
    </xsl:template>

    <xsl:template match="tei:head">
        <xsl:variable name="level">
            <xsl:value-of select="count(ancestor-or-self::tei:div)"/>
        </xsl:variable>
        <xsl:element name="{concat('h', $level + 1)}">
            <xsl:attribute name="class">
                <xsl:value-of select="'text-center'" />
            </xsl:attribute>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>


    <xsl:template match="tei:p">
        <p id="{generate-id()}">
            <xsl:if test="@ana">
                <xsl:attribute name="class">
                    <xsl:value-of select="@ana" disable-output-escaping="yes"/>
                </xsl:attribute>
            </xsl:if>
            <xsl:if test="@xml:id[contains(.,'address_')]">
            	<xsl:attribute name="class">
                    <xsl:text>address</xsl:text>
                </xsl:attribute>
            </xsl:if>
            <xsl:apply-templates/>
        </p>
    </xsl:template>
    <xsl:template match="tei:div">
        <div id="{generate-id()}">
	    <xsl:choose>
                <xsl:when test="(@type='de') or (@type='en')">
                     <xsl:attribute name="class">
                         <xsl:text>lang </xsl:text>
                         <xsl:value-of select="@type" />
                     </xsl:attribute>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:attribute name="class" select="@type" />
                </xsl:otherwise>
            </xsl:choose>
            <xsl:apply-templates/>
        </div>
    </xsl:template>
    <xsl:template match="tei:lb">
        <br/>
    </xsl:template>
    <xsl:template match="tei:unclear">
        <abbr title="unclear">
            <xsl:apply-templates/>
        </abbr>
    </xsl:template>
    <xsl:template match="tei:del">
        <del>
            <xsl:apply-templates/>
        </del>
    </xsl:template>
    <xsl:template match="tei:ref">
        <a>
            <xsl:if test="@target">
                <xsl:attribute name="href">
                    <xsl:value-of select="@target"/>
                </xsl:attribute>
                <xsl:attribute name="style"> text-decoration: underline; </xsl:attribute>
            </xsl:if>
            <xsl:apply-templates/>
        </a>
    </xsl:template>


    <xsl:template match="tei:table">
        <xsl:element name="table">
            <xsl:attribute name="class">
                <xsl:text>table table-bordered table-striped table-condensed table-hover</xsl:text>
            </xsl:attribute>
            <xsl:element name="tbody">
                <xsl:apply-templates/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template match="tei:row">
        <xsl:element name="tr">
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="tei:cell">
        <xsl:element name="td">
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>
    <xsl:template match="tei:listPerson">
    	<ul class="listPerson">
		<xsl:for-each select="./tei:person">
		<li><xsl:value-of select="./tei:persName/text()"/></li>
		</xsl:for-each>
    	</ul>
    </xsl:template>
    <xsl:template match="tei:orgName">
        <b><xsl:apply-templates /></b>
        <xsl:value-of select="$mybreak" disable-output-escaping="yes"/> 
    </xsl:template>
    <xsl:template match="tei:placeName">
        <xsl:choose>
	    <xsl:when test="@type='institution'">
                <b><xsl:apply-templates /></b>
                <xsl:value-of select="$mybreak" disable-output-escaping="yes"/> 
	    </xsl:when>
	    <xsl:when test="@type='postalcode'">
                <xsl:value-of select="." />
                <xsl:text> </xsl:text>
            </xsl:when>
            <xsl:when test="@type='municipality'">
                <xsl:value-of select="." />
                <xsl:text>, </xsl:text>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="." />
                <xsl:value-of select="$mybreak" disable-output-escaping="yes"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
     <xsl:template match="tei:desc">
        <xsl:value-of select="." />
        <xsl:value-of select="$mybreak" disable-output-escaping="yes"/> 
    </xsl:template>
</xsl:stylesheet>
