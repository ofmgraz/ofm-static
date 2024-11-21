<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    version="2.0" exclude-result-prefixes="xsl tei xs">
    <xsl:param name="mybreak"><![CDATA[<br/>]]></xsl:param>
    
  

   <xsl:template match="tei:person" name="person_detail">
       
        <xsl:param name="showNumberOfMentions" as="xs:integer" select="50000" />
        <xsl:variable name="id" select="./@xml:id" />
        <xsl:variable name="selfLink">
            <xsl:value-of select="concat(data(@xml:id), '.html')"/>
        </xsl:variable>
        <div class="card-body">
            <xsl:if test="./tei:residence/tei:date">
                    <small>Geburtsdatum: </small><xsl:value-of select="tokenize(./tei:residence/tei:date/@notBefore, '-')[1]"/><xsl:value-of select="$mybreak" disable-output-escaping="yes"/>
            
            </xsl:if>
            <xsl:if test="./tei:residence/tei:date">
                    <small>Todesdatum: </small>  <xsl:value-of select="tokenize(./tei:residence/tei:date/@notAfter, '-')[1]"/><xsl:value-of select="$mybreak" disable-output-escaping="yes"/>
            </xsl:if>
            <xsl:if test="./tei:occupation/text()">
                <small>Tätigkeit: </small> <xsl:value-of select="tokenize(./tei:occupation, '/')[last()]"/><xsl:value-of select="$mybreak" disable-output-escaping="yes"/>

            </xsl:if>
            <xsl:if test="./tei:residence/tei:settlement/tei:placeName">
                <small>Wirkungsort: </small><xsl:variable name="a" select="./tei:residence/tei:settlement/tei:placeName/text()"/>
			<a href="{$a}.html" target="_blank">
				<xsl:value-of select="./tei:residence/tei:settlement/tei:placeName"/>
			</a><xsl:value-of select="$mybreak" disable-output-escaping="yes"/>
            </xsl:if>

            <xsl:if test="./tei:idno[@subtype='GND']/text()">
                <small>GND ID: </small> <a href="{./tei:idno[@subtype='GND']}" target="_blank"><xsl:value-of select="tokenize(./tei:idno[@subtype='GND'], '/')[last()]"/></a><br/><xsl:value-of select="$mybreak" disable-output-escaping="yes"/>
            </xsl:if>
            <xsl:if test="./tei:idno[@subtype='WIKIDATA']/text()">
                <small>Wikidata ID: </small>
                <a href="{./tei:idno[@subtype='WIKIDATA']}" target="_blank">
                    <xsl:value-of select="tokenize(./tei:idno[@subtype='WIKIDATA'], '/')[last()]"/>
                </a><xsl:value-of select="$mybreak" disable-output-escaping="yes"/>
            </xsl:if>
            <br/>
            <hr />
            <div id="mentions" align="left">
                <legend>Verantwortlich für:</legend>
                <ul>
                    <xsl:for-each select="//tei:relation[@active=concat('#', $id)]">
                        <xsl:variable name="newtext" select="replace(data(@passive), 'A', 'A ')"/>
                        <xsl:variable name="newtext" select="replace($newtext, 'S', 'S ')"/>
                        <xsl:variable name="newtext" select="translate($newtext, '_', '/')"/>
                        <xsl:variable name="newtext" select="replace($newtext, '.xml','')" />
                        <li>
                            <a href="{./@passive}">
                                <xsl:value-of select="concat('A-Gf ', $newtext)"/>
                            </a>
                        </li>
                    </xsl:for-each>
                </ul>
                <xsl:if test="count(.//tei:noteGrp/tei:note) gt $showNumberOfMentions + 1">
                    <p>Anzahl der Erwähnungen limitiert, klicke <a href="{$selfLink}">hier</a> für eine vollständige Auflistung</p>
                </xsl:if>
            </div>
        </div>
    </xsl:template>
</xsl:stylesheet>