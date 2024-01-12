<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema"
    exclude-result-prefixes="#all" version="2.0">
    <xsl:template match="/" name="html_footer">
        <div class="wrapper hide-reading" id="wrapper-footer-full">
            <div class="container-fluid" id="footer-full-content" tabindex="-1">
                <div class="footer-separator"> KONTAKT </div>
                <div class="row">
                    <div
                        class="footer-widget col-lg-1 col-md-2 col-sm-2 col-xs-6  ml-auto  text-center ">
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
                    <div class="footer-widget col-lg-4 col-md-3 col-sm-3">
                        <div class="textwidget custom-html-widget">
                            <p>
                                ACDH-CH
                                <br/>
                                Austrian Centre for Digital Humanities <br></br> and Cultural Heritage
                                <br/>
                                Österreichische Akademie der Wissenschaften
                            </p>
                            <p>
                                Bäckerstraße 13
                                <br/>
                                1010 Wien
                            </p>
                            <p>
                                T: +43 1 51581-2200
                                <br/>
                                E: <a href="mailto:acdh-ch-helpdesk@oeaw.ac.at
                                    ">acdh-ch-helpdesk(at)oeaw.ac.at</a>
                            </p>
                        </div>
                    </div>
                    <!-- I leave the div to be a place holder <div class="footer-widget col-lg-3 col-md-4 col-sm-3 ml-auto">
                        <div class="row">
                            <div class="textwidget custom-html-widget">
                                <h6 class="font-weight-bold"></h6>
                                <a href="https://www.fwf.ac.at/">
                                    <img class="card-img-right flex-auto d-md-block"
                                        src="https://www.fwf.ac.at/fileadmin/Website/Logos/FWF_Logo_Zusatz_Blau_RGB_DE.svg"
                                        alt="FWF Österreichischer Wissenschaftsfond Logo"
                                        style="max-width: 140px; height: auto; margin-top:1em;"
                                        title="FWF Der Wissenschaftsfond"/>
                                </a>
                                <p/>
                                <p><br/><br/>Gefördert aus Mitteln des<br/> Wissenschaftsfonds FWF,<br/>
                                    P31277 (2018–2021) und <br/>P34792 (2021–[2024]) </p>
                            </div>
                        </div>
                    </div>-->
                    <!-- .footer-widget -->
                    <div class="footer-widget col-lg-3 col-md-4 col-sm-3 ml-auto">
                        <div class="row">
                            <div class="textwidget custom-html-widget">
                                <h6 class="font-weight-bold">HELPDESK</h6>
                                <p>Bei Fragen, Anmerkungen, Kritik, aber gerne auch Lob, wenden Sie
                                    sich bitte an den ACDH-CH Helpdesk.</p>
                                <p>
                                    <a class="helpdesk-button"
                                        href="mailto:acdh-ch-helpdesk@oeaw.ac.at">e-Mail</a>
                                </p>
                            </div>
                        </div>
                        <div class="row">
                                <div class="textwidget custom-html-widget col-md-4">
                                    <a id="github-logo" title="GitHub" href="{$github_url}"
                                        class="nav-link" target="_blank">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32"
                                            height="32" viewBox="0 0 24 24">
                                            <path
                                                d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-4.466 19.59c-.405.078-.534-.171-.534-.384v-2.195c0-.747-.262-1.233-.55-1.481 1.782-.198 3.654-.875 3.654-3.947 0-.874-.312-1.588-.823-2.147.082-.202.356-1.016-.079-2.117 0 0-.671-.215-2.198.82-.64-.18-1.324-.267-2.004-.271-.68.003-1.364.091-2.003.269-1.528-1.035-2.2-.82-2.2-.82-.434 1.102-.16 1.915-.077 2.118-.512.56-.824 1.273-.824 2.147 0 3.064 1.867 3.751 3.645 3.954-.229.2-.436.552-.508 1.07-.457.204-1.614.557-2.328-.666 0 0-.423-.768-1.227-.825 0 0-.78-.01-.055.487 0 0 .525.246.889 1.17 0 0 .463 1.428 2.688.944v1.489c0 .211-.129.459-.528.385-3.18-1.057-5.472-4.056-5.472-7.59 0-4.419 3.582-8 8-8s8 3.581 8 8c0 3.533-2.289 6.531-5.466 7.59z"
                                            />
                                        </svg>
                                    </a>
                                </div>
                            
                        </div>
                    </div>
                    <!-- .footer-widget -->
                </div>
            </div>
        </div>
        <!-- #wrapper-footer-full -->
        <div class="footer-imprint-bar hide-reading" id="wrapper-footer-secondary"
            style="text-align:center; padding:0.4rem 0; font-size: 0.9rem;"> © Copyright OEAW | <a
                href="imprint.html">Impressum</a>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/typesense-instantsearch-adapter@2/dist/typesense-instantsearch-adapter.min.js"/>
        <script src="https://cdn.jsdelivr.net/npm/algoliasearch@4.5.1/dist/algoliasearch-lite.umd.js" integrity="sha256-EXPXz4W6pQgfYY3yTpnDa3OH8/EPn16ciVsPQ/ypsjk=" crossorigin="anonymous"/>
        <script src="https://cdn.jsdelivr.net/npm/instantsearch.js@4.8.3/dist/instantsearch.production.min.js" integrity="sha256-LAGhRRdtVoD6RLo2qDQsU2mp+XVSciKRC8XPOBWmofM=" crossorigin="anonymous"/>
        <script src="js/listStopProp.js"/>
        <script src="https://code.jquery.com/jquery-3.6.3.min.js" integrity="sha256-pvPw+upLPUjgMXY0G+8O0xUf+/Im1MZjXxxgOcBQBXU=" crossorigin="anonymous"/>
    </xsl:template>
</xsl:stylesheet>
