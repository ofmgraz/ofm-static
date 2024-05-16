var pb_elements = document.getElementsByClassName("pb");
var tileSources = [];

for(var index=0;index < pb_elements.length;index++){
    tileSources.push({type: "image", url: pb_elements[index].getAttribute("source")})
} ;


function isMobile(x) {
    if (x.matches) { // If media query matches
      var position = "horizontal";
    } else {
      var position = "vertical"
    }
    return position
  }
  
  // Create a MediaQueryList object
  var x = window.matchMedia("(max-width: 700px)")

  position = isMobile(x)
  x.addEventListener("change", function() {
    isMobile(x);
  }); 
  
  var viewer = OpenSeadragon({
    id: "seadragon-viewer",
    prefixUrl: "//openseadragon.github.io/openseadragon/images/",
    sequenceMode: true,
    tileSources: tileSources,
    referenceStripSizeRatio: 0.1,
    showHomeControl: true,
    showReferenceStrip: true,
  });
  