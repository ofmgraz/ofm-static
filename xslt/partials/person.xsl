<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    version="2.0" exclude-result-prefixes="xsl tei xs">
    
    <xsl:template match="tei:person" name="person_detail">
        <table class="table entity-table">
            <tbody>
                <xsl:if test="./tei:residence/tei:date">
                <tr>
                    <th>
                        Geburtsjahr
                    </th>
                    <td>
                        <xsl:value-of select="tokenize(./tei:residence/tei:date/@notBefore, '-')[1]"/>
                    </td>
                </tr>
                </xsl:if>
                <xsl:if test="./tei:residence/tei:date">
                <tr>
                    <th>
                        Sterbejahr
                    </th>
                    <td>
                        <xsl:value-of select="tokenize(./tei:residence/tei:date/@notAfter, '-')[1]"/>
                    </td>
                </tr>
                </xsl:if>
                <xsl:if test="./tei:residence/tei:settlement/tei:placeName">
                <tr>
                    <th>
                        Aktiv in:
                    </th>
                    <td>
			<xsl:variable name="a" select="./tei:residence/tei:settlement/tei:placeName/text()"/>
			<a href="{$a}.html" target="_blank">
				<xsl:value-of select="./tei:residence/tei:settlement/tei:placeName"/>
			</a>
                    </td>
                </tr>
                </xsl:if>

                <xsl:if test="./tei:idno">
                    <tr>
                        <th>
                            Authority
                        </th>
                        <td>
                            <ul>
                                <xsl:for-each select="./tei:idno">
                                    
                                    <li><a>
                                        <xsl:attribute name="href">
                                            <xsl:value-of
                                                select="tokenize(./text(), ' ')[last()]"/>
                                        </xsl:attribute>
                                        <xsl:value-of select="./@subtype"/>
                                    </a></li>
                                    
                                </xsl:for-each>
                            </ul>
                        </td>
                    </tr>
                </xsl:if>
                <xsl:if test="./tei:listEvent">
                <tr>
                    <th>
                        Verantwortlich für:
                    </th>
                    <td>
                        <ul>
                            <xsl:for-each select="./tei:listEvent/tei:event">
                                <li>
                                    <a href="{replace(./tei:linkGrp/tei:link/@target, '.xml', '.html')}">
                                        <xsl:value-of select="./tei:p/tei:title"/>
                                    </a>
                                </li>
                            </xsl:for-each>
                        </ul>
                    </td>
                </tr>
                </xsl:if>
            </tbody>
        </table>
    </xsl:template>
</xsl:stylesheet>
