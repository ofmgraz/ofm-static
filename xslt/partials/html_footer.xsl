<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    exclude-result-prefixes="#all" version="2.0">
   <xsl:param name="mybreak"><![CDATA[<br/>]]></xsl:param>
    <xsl:template match="/" name="html_footer">
        <!-- <div clas="wrapperhide-reading" id="wrapper-footer-full"> -->
        <footer class="footer">
            <div class="row justify-content-center">
                <!-- KONTAKT -->
                <div class="col-4 col-md-5 text-center">
                    <h5 class="font-weight-bold hide-mobile align-left">KONTAKT:</h5>
                    <div class="row">
                        <div class="footer-widget col-12 col-md-3 pad">
                            <a href="https://www.oeaw.ac.at/acdh/">
                                <img
                                    src="https://fundament.acdh.oeaw.ac.at/common-assets/images/acdh_logo.svg"
                                    class="image logo acdh" alt="ACDH Logo"
                                    title="ACDH Logo"/>
                            </a>
                        </div>
                        <div class="footer-widget col-1 col-md-7 align-left">
                            <b class="hide-mobile">ACDH-CH</b>&#160;&#160;&#160;
                            <p class="hide-mobile">
                                <b>Austrian Centre for Digital Humanities and Cultural Heritage</b>
                                <xsl:value-of select="$mybreak" disable-output-escaping="yes"/>
                                Österreichische Akademie der Wissenschaften
                                <xsl:value-of select="$mybreak" disable-output-escaping="yes"/>
                                Bäckerstraße 13
                                <xsl:value-of select="$mybreak" disable-output-escaping="yes"/> 1010 Wien
                                <xsl:value-of select="$mybreak" disable-output-escaping="yes"/>
                                <i class="bi bi-telephone"/>&#160;<a href="tel:+431515812200">+43 1 51581-2200</a>
                                <xsl:value-of select="$mybreak" disable-output-escaping="yes"/>
                                <i class="bi bi-envelope-at"/>&#160;<a href="mailto:acdh-ch-helpdesk@oeaw.ac.at">acdh-ch-helpdesk(at)oeaw.ac.at</a>
                            </p>
                        </div>
                    </div>
                </div>
                <!-- FUNDING -->
                <div class="col-6 col-md-4">
                    <!-- <div class="footer-widget col-lg-1 col-md-2 col-sm-2 col-xs-6 justify-content overflow-hidden"> -->
                    <h5 class="font-weight-bold hide-mobile align-left">FÖRDERUNG:</h5>
                    <div class="row">
                        <div class="footer-widget col-lg-8 text-center">
                            <a href="https://www.bmkoes.gv.at/">
                                <img
                                    src="images/BMKOES_Logo_srgb.svg"
                                    class="image logo" alt="Finanziert vom Bundeministeirum für Kunst, Kultur, öffentlichen Dienst und Sport"
                                    title="Finanziert vom Bundeministeirum für Kunst, Kultur, öffentlichen Dienst und Sport"/>
                            </a>
                        </div>
                        <div class="spacing"/>
                        <div class="footer-widget col-lg-8 text-center">
                            <a href="https://next-generation-eu.europa.eu/index_de">
                                <img
                                    src="images/DE_Finanziert_von_der_Europäischen_Union_RG_POS.png"
                                    class="image logo" alt="Finanziert von der Europäischen Union – NextGenerationEU"
                                    title="Finanziert von der Europäischen Union – NextGenerationEU"/>
                            </a>
                        </div>
                    </div>
                </div>
                <!-- HD -->
                <div class="col-2 hide-midi">
                    <h5 class="font-weight-bold hide-mobile align-left">&#8203;</h5>
                    <div class="footer-widget">
                        <!-- .footer-widget -->
                        <p>Bei Fragen, Anmerkungen, Kritik, aber gerne auch Lob, wenden Sie sich bitte an den <a href="mailto:acdh-ch-helpdesk@oeaw.ac.at">ACDH-CH Helpdesk</a>.</p>
                    </div>
                    <!-- .footer-widget -->
                </div>
            </div>
        </footer>
        <!-- #wrapper-footer-full -->
        <div class="footer-imprint-bar hide-reading" id="wrapper-footer-secondary">© Copyright OEAW | <a
                href="imprint.html">Impressum</a> | <a href="{$github_url}"><i class="bi bi-github"/></a></div>
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
