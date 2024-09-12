<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    exclude-result-prefixes="#all" version="2.0">
   <xsl:param name="mybreak"><![CDATA[<br/>]]></xsl:param>
    <xsl:template match="/" name="html_footer">
        <!-- <div clas="wrapperhide-reading" id="wrapper-footer-full"> -->
        <footer class="footer">
            <div class="container-fluid" id="footer-full-content" tabindex="-1 overflow-hidden">
                <div class="row justify-content-center overflow-hidden">
                    <div class="footer-widget col-lg-1 col-md-2 col-sm-2 col-xs-6 text-right overflow-hidden"> <h5 class="font-weight-bold">KONTAKT</h5>
                    </div>
                    <div
                        class="footer-widget col-lg-1 col-md-2 col-sm-2 col-xs-6 text-center overflow-hidden">
                        <div class="textwidget custom-html-widget">
                            <a href="https://www.oeaw.ac.at/acdh/">
                                <img
                                    src="https://fundament.acdh.oeaw.ac.at/common-assets/images/acdh_logo.svg"
                                    class="image" alt="ACDH Logo"
                                    style="max-width: 90%; height: auto;" title="ACDH Logo"/>
                            </a>
                        </div>
                    </div>
                    <!-- .footer-widget -->
                    <div class="footer-widget col-lg-3 col-md-4 col-sm-3 overflow-hidden">
                        <div class="textwidget custom-html-widget overflow-hidden">
                            <b>ACDH-CH</b>
                            <p><b>Austrian Centre for Digital Humanities and Cultural Heritage</b>
                                <xsl:value-of select="$mybreak" disable-output-escaping="yes"/> Österreichische Akademie der Wissenschaften
                            <xsl:value-of select="$mybreak" disable-output-escaping="yes"/>Bäckerstraße 13 <xsl:value-of select="$mybreak" disable-output-escaping="yes"/> 1010 Wien
                            <xsl:value-of select="$mybreak" disable-output-escaping="yes"/><i class="bi bi-telephone" />&#160;<a href="tel:+431515812200">+43 1 51581-2200</a><xsl:value-of select="$mybreak" disable-output-escaping="yes"/><i class="bi bi-envelope-at" />&#160;<a
                                    href="mailto:acdh-ch-helpdesk@oeaw.ac.at
                                "
                                    >acdh-ch-helpdesk(at)oeaw.ac.at</a>
                            </p>
                        </div>
                    </div>
                    <!-- .footer-widget -->
                    <div class="footer-widget col-lg-3 col-md-4 col-sm-3 overflow-hidden">
                        <div class="row">
                            <div class="textwidget custom-html-widget overflow-hidden">
                                <b>HELPDESK</b>
                                <p>Bei Fragen, Anmerkungen, Kritik, aber gerne auch Lob, wenden Sie
                                    sich bitte an den ACDH-CH Helpdesk.</p>
                                <!-- <p>
                                    <i class="bi bi-envelope-at" />&#160;<a class="helpdesk-button"
                                        href="mailto:acdh-ch-helpdesk@oeaw.ac.at">acdh-ch-helpdesk@oeaw.ac.at</a>
                                </p> -->
                            </div>
                        </div>
                    </div>
                    <!-- .footer-widget -->
                    <div class="footer-widget footer-widget col-lg-3 col-md-4 col-sm-3 overflow-hidden float-right">
                        <a href="{$github_url}" class="to_center">
                            <i class="bi bi-github"/>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
        <!-- #wrapper-footer-full -->
        <div class="footer-imprint-bar hide-reading" id="wrapper-footer-secondary"
            style="text-align:center; padding:0.4rem 0; font-size: 0.9rem;"> © Copyright OEAW | <a
                href="imprint.html">Impressum</a></div>
        <script src="https://cdn.jsdelivr.net/npm/typesense-instantsearch-adapter@2/dist/typesense-instantsearch-adapter.min.js"/>
        <script src="https://cdn.jsdelivr.net/npm/algoliasearch@4.5.1/dist/algoliasearch-lite.umd.js" integrity="sha256-EXPXz4W6pQgfYY3yTpnDa3OH8/EPn16ciVsPQ/ypsjk=" crossorigin="anonymous"/>
        <script src="https://cdn.jsdelivr.net/npm/instantsearch.js@4.8.3/dist/instantsearch.production.min.js" integrity="sha256-LAGhRRdtVoD6RLo2qDQsU2mp+XVSciKRC8XPOBWmofM=" crossorigin="anonymous"/>
        <script src="js/listStopProp.js"/>
        <script src="https://code.jquery.com/jquery-3.6.3.min.js" integrity="sha256-pvPw+upLPUjgMXY0G+8O0xUf+/Im1MZjXxxgOcBQBXU=" crossorigin="anonymous"/>
        <script src="https://code.jquery.com/jquery-3.6.3.min.js" integrity="sha256-pvPw+upLPUjgMXY0G+8O0xUf+/Im1MZjXxxgOcBQBXU=" crossorigin="anonymous"/>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"/>
        <script src="js/i18n.js"/>
    </xsl:template>
</xsl:stylesheet>
