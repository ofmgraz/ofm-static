<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="xs xsl tei" version="2.0">
    <xsl:output encoding="UTF-8" media-type="text/html" method="xhtml" version="1.0" indent="yes" omit-xml-declaration="yes"/>
    <xsl:variable name="target_xml">
        <xsl:value-of select="'./xml-sources'"/>
    </xsl:variable>
    <xsl:variable name="doc_id">
        <xsl:value-of select="data(tei:TEI/@xml:id)"/>
    </xsl:variable>
    <xsl:template name="build_doc_sub_list">
        <xsl:param name="id_name_for_toggle"></xsl:param>
        <xsl:param name="heading"></xsl:param>
        <xsl:param name="expanded" as="xs:string" select="'false'"/>
        <li>
            <button class="btn btn-toggle align-items-center rounded collapsed" data-bs-toggle="collapse" data-bs-target="#{$id_name_for_toggle}" aria-expanded="{$expanded}">
                <xsl:value-of select="$heading"/>
            </button>
            <div class="collapse " id="{$id_name_for_toggle}">
                <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
               <!-- <xsl:for-each select="collection('../../data/editions/')//tei:TEI[.//tei:teiHeader[1]/tei:fileDesc[1]/tei:publicationStmt[1]/tei:idno[@type='transkribus_collection' and ./text()=$data_set_id_transkribus]]" > -->
                    <xsl:for-each select="collection('../../data/editions/')//tei:TEI[.//tei:teiHeader[1]/tei:fileDesc[1]/tei:sourceDesc[1]/tei:msDesc[1]/tei:msContents[1]]">
                        <xsl:variable as="xs:string" name="text_title" select="//tei:fileDesc//tei:titleStmt//tei:title[@type='main']/normalize-space()"/>
                        <xsl:variable as="xs:string" name="page_uri" select="replace(tokenize(document-uri(/), '/')[last()], '.xml', '.html')"/>
                        <li>
                            <a class="dropdown-item" href="{$page_uri}"
                               title="{$text_title}">
                                <xsl:value-of select="$text_title"/>
                            </a>
                        </li>
                    </xsl:for-each>
                </ul>
            </div>
        </li>
    </xsl:template>
    
    <xsl:template name="get_article_nav">
        <xsl:for-each select=".//tei:div[@type='article']">
            <xsl:variable name="article_title" select="./tei:head[1]/normalize-space()"/>
            <li>
                <a class="dropdown-item" title="{$article_title}">
                    <xsl:attribute name="href">
                        <xsl:value-of select="concat('#', (.//tei:a[contains(@class, 'navigation')]/@xml:id)[1])"/>
                    </xsl:attribute>
                    <xsl:value-of select="$article_title"/>
                </a>
            </li>
        </xsl:for-each>
    </xsl:template>
    
    <xsl:template name="get_chapter_and_article_nav">
        <xsl:variable name="section_divs" select=".//tei:body//tei:div[contains(@type, 'section')]"/>
        <xsl:variable name="section_divs_exist" select="if ($section_divs) then 'true' else 'false'"/>
        <xsl:choose>
            <xsl:when test="$section_divs_exist = 'true'">
                <xsl:for-each select="$section_divs">
                    <li>
                        <xsl:variable name="derived_target_id_for_button" select="concat('target_of_', (.//tei:a[contains(@class, 'navigation')]/@xml:id)[1])"/>
                        <button class="btn btn-toggle align-items-center rounded collapsed" data-bs-toggle="collapse" data-bs-target="#{$derived_target_id_for_button}" aria-expanded="false">
                            <xsl:value-of select="./tei:head[1]/normalize-space()"/>
                        </button>
                        <div class="collapse " id="{$derived_target_id_for_button}">
                            <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                                <xsl:call-template name="get_article_nav"/>
                            </ul>
                        </div>
                    </li>
                </xsl:for-each>
            </xsl:when>
            <xsl:otherwise>
                <xsl:call-template name="get_article_nav"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
   <xsl:template name="edition_side_nav">
        <xsl:param name="book_type"/>
        <div id="edtion-navBarNavDropdown" class="dropstart navBarNavDropdown">
            <!-- <xsl:variable name="data_set_A_id" as="xs:string" select="ofm"/> -->
	    <xsl:if test="contains(./@class, '#ofm')">
		<xsl:variable name="data_set_A_id" select="'ofm'"/>
	    </xsl:if>
	    <xsl:if test="contains(./@class, 'osc')">
		<xsl:variable name="data_set_B_id" select="'osd'"/>
	    </xsl:if>
	    <xsl:if test="contains(./@class, 'oesa')">
		<xsl:variable name="data_set_C_id" select="'oesa'"/>
	    </xsl:if>

            <ul id="left_edition_content_nav" class="list-unstyled ps-0">
                <li class="mb-1">
                    <button class="btn btn-toggle align-items-center rounded collapsed" data-bs-toggle="collapse" data-bs-target="#docs-collapse" aria-expanded="false">
                        Alle Dokumente
                    </button>
                    <div class="collapse" id="docs-collapse">
                        <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                            <xsl:call-template name="build_doc_sub_list">
                                <xsl:with-param name="id_name_for_toggle" select="'ofm'"/>
                                <xsl:with-param name="heading" select="'Ordo Fratrum Minorum'"/>
                                <xsl:with-param name="expanded" select="'true'"/>
                            </xsl:call-template>
                            <xsl:call-template name="build_doc_sub_list">
                                <xsl:with-param name="id_name_for_toggle" select="'osd'"/>
                                <xsl:with-param name="heading" select="'Ordo Sancti Dominci'"/>
                            </xsl:call-template>
                            <xsl:call-template name="build_doc_sub_list">
                                <xsl:with-param name="id_name_for_toggle" select="'oesa'"/>
                                <xsl:with-param name="heading" select="'Ordo Eremitarum Sancti Augustini'"/>
                            </xsl:call-template>
                        </ul>
                    </div>
                </li> 
                <li class="mb-1">
                    <button class="btn btn-toggle align-items-center rounded collapsed" data-bs-toggle="collapse" data-bs-target="#current-doc-collapse" aria-expanded="false">
                        <xsl:value-of
                            select="$book_type"
                            />
                    </button>                                       
                    <div class="collapse" id="current-doc-collapse">
                        <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
                            <xsl:call-template name="get_chapter_and_article_nav"/>
                        </ul>
                    </div>
                </li>
            </ul>
            <h3>
                <a href="{$target_xml}/{$doc_id}.xml">
                    <i class="fas fa-download" title="show TEI source"/> Download
                </a>
            </h3>
        </div>
        
    </xsl:template>
</xsl:stylesheet>
