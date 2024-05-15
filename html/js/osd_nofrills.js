var pb_elements = document.getElementsByClassName("pb");
var tileSources = [];

for(var index=0;index < pb_elements.length;index++){
    tileSources.push({type: "image", url: pb_elements[index].getAttribute("source")})
} ;

  
  var viewer = OpenSeadragon({
    id: "seadragon-viewer",
    prefixUrl: "//openseadragon.github.io/openseadragon/images/",
    sequenceMode: true,
    showReferenceStrip: true,
    tileSources: tileSources
  });
  