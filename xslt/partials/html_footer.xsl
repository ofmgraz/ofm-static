<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet 
    xmlns="http://www.w3.org/1999/xhtml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    exclude-result-prefixes="#all"
    version="2.0">
    <xsl:template match="/" name="html_footer">
        
        <div class="wrapper hide-reading" id="wrapper-footer-full">
            <div class="container-fluid" id="footer-full-content" tabindex="-1">
                <div class="col-auto row justify-content-center align-items-center">
                    <div class="col-auto row justify-content-start align-items-center">
                        <!--<h6 class="font-weight-bold" style="font-variant: small-caps;">Projektpartner</h6>-->
                        <div class="col-auto">
                            <a href="http://www.franziskaner-graz.at/links/">
                                <img class="card-img-right flex-auto d-md-block" 
                                     src="./images/footer_logos/foo/bar.png"
                                     alt="Franziskanaerkloster Graz"
                                     title="Franziskanaerkloster Graz"/>
                            </a>
                        </div>
                        <div class="col-auto">
                            <a href="https://www.oeaw.ac.at/acdh/acdh-ch-home">
                                <img width="50" height="50" src="https://fundament.acdh.oeaw.ac.at/common-assets/images/acdh-ch-logo-with-text-grayscale.png" 
                                     class="image" 
                                     alt="ACDHCH Logo" 
                                     title="ACDHCH Logo"/>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="col-auto row justify-content-center align-items-center">
                    <div class="col-auto row justify-content-start align-items-center">
                        <!--<h6 class="font-weight-bold" style="font-variant: small-caps;">Förderungsgeber</h6>-->
                        <div class="col-auto">
                            <a href="https://readcoop.eu/">
                                <img class="card-img-right flex-auto d-md-block" 
                                     src="./images/footer_logos/foo/bar.png"
                                     alt="READ co·op" 
                                     title="READ co·op"/>
                            </a>
                        </div>
                        <div class="col-auto ">
                            <a href="https://www.cantusplanus.at/en-uk/index.html">
                                <img class="card-img-right flex-auto d-md-block" 
                                     src="./images/footer_logos/foo/bar.png"
                                     alt="Cantus Planus Austria" 
                                     title="Cantus Planus Austria"/>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- #wrapper-footer-full -->
        <div class="footer-imprint-bar text-light hide-reading" id="wrapper-footer-secondary">
            © Copyright OEAW | <a href="https://www.oeaw.ac.at/oeaw/impressum">Impressum/Imprint</a>
        </div>
        <script src="https://code.jquery.com/jquery-3.6.3.min.js" integrity="sha256-pvPw+upLPUjgMXY0G+8O0xUf+/Im1MZjXxxgOcBQBXU=" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js" integrity="sha384-oBqDVmMz9ATKxIep9tiCxS/Z9fNfEXiDAYTujMAeBAsjFuCZSmKbSSUnQlmh/jp3" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script>
        <script src="js/listStopProp.js"></script>
    </xsl:template>
</xsl:stylesheet>
