document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  let currentIndex = 0;
  let isManualNavigation = false;
  let overlayShown = false;
  let currentImageBounds = null;
  let currentImageDimensions = null;

  const viewer = OpenSeadragon({
    id: 'container_facs_1',
    prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/',
    visibilityRatio: 1,
    sequenceMode: true,
    showNavigator: false,
    showSequenceControl: true,
    showNavigationControl: true,
    constrainDuringPan: true,
    tileSources: [],
  });

  function refreshNavigationControls() {
    const prev = document.querySelector("div[title='Previous page']");
    const next = document.querySelector("div[title='Next page']");
    
    if (prev && next) {
      prev.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
      prev.style.opacity = currentIndex === 0 ? '0.5' : '1';
      
      next.style.pointerEvents = currentIndex === viewer.tileSources.length - 1 ? 'none' : 'auto';
      next.style.opacity = currentIndex === viewer.tileSources.length - 1 ? '0.5' : '1';
    }
  }

  function getIIIFManifests() {
    const pbElements = document.getElementsByClassName("pb");
    const manifests = [];

    Array.from(pbElements).forEach(function (el) {
      const imgSource = el.getAttribute("source");
      if (imgSource) {
        const manifestUrl = `https://arche-iiifmanifest.acdh.oeaw.ac.at/?id=${encodeURIComponent(imgSource)}&mode=images`;
        manifests.push(manifestUrl);
      } else {
        console.warn("No 'source' attribute found for element:", el);
      }
    });

    return manifests;
  }

function addSurfaceOverlay() {
    const overlay = document.createElement('div');
    //overlay.style.border = '2px solid blue';
    overlay.style.position = 'absolute';
    overlay.style.pointerEvents = 'none';
    
    const currentImage = viewer.world.getItemAt(0);
    if (currentImage) {
      currentImageBounds = currentImage.getBounds();
      viewer.addOverlay({
        element: overlay,
        location: currentImageBounds
      });
      console.log('currenImageBounds:', currentImageBounds) ;
    }
  }
 
  function loadImageFromManifest(manifestUrl) {
    fetch(manifestUrl)
      .then(response => response.json())
      .then(data => {
        const images = data.images || [];
        if (images.length > 0) {
          // Get image dimensions from manifest
          const image = images[0];
          if (typeof image === 'object' && image.height && image.width) {
            currentImageDimensions = {
              width: image.width,
              height: image.height
            };
            console.log('Image dimensions:', currentImageDimensions);
          }
          const optimizedImages = images.map(image => {
            if (typeof image === 'string') {
              return image.replace(/\/full\/[^\/]+\/default\.(jpg|png)$/, '/full/!600,600/0/default.$1');
            }
            return image;
          });
  
          viewer.tileSources = optimizedImages;
          
          // Clear overlays before opening new image
          viewer.clearOverlays();
          
          viewer.open(optimizedImages[currentIndex]);
          
          // Add handler for when image loads
          viewer.addHandler('open', function() {
            // Add the surface overlay
            addSurfaceOverlay();
            
            const hash = window.location.hash.substring(1);
            if (hash) {
              const xmlPath = window.location.pathname.replace('.html', '.xml');
              loadAndParseXML(xmlPath);
            }
          });
          
          refreshNavigationControls();
        }
      })
      .catch(err => console.error("Error loading IIIF manifest:", err));
  }

  function setupScrollNavigation() {
    const pbElements = document.getElementsByClassName("pb");
    const scrollContainer = document.querySelector('#transcript');
    
    scrollContainer.addEventListener("scroll", function() {
      if (isManualNavigation) return;

      let mostVisibleIndex = currentIndex;
      let maxVisibility = 0;

      Array.from(pbElements).forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        const visibility = Math.min(rect.bottom, containerRect.bottom) - Math.max(rect.top, containerRect.top);

        console.log(`Element ${index} visibility: ${visibility}`); // Log visibility

        if (visibility > maxVisibility) {
          maxVisibility = visibility;
          mostVisibleIndex = index;
        }
      });

      if (mostVisibleIndex !== currentIndex) {
        console.log(`Changing page from ${currentIndex} to ${mostVisibleIndex}`); // Log page change
        currentIndex = mostVisibleIndex;
        loadImageFromManifest(iiifManifests[currentIndex]);
        refreshNavigationControls();
      }
    });
  }

  function setupNavigationButtons(manifests) {
    const prev = document.querySelector("div[title='Previous page']");
    const next = document.querySelector("div[title='Next page']");

    if (prev && next) {
      prev.addEventListener("click", () => {
        if (currentIndex > 0) {
          currentIndex--;
          loadImageFromManifest(manifests[currentIndex]);
        } else {
          console.log("No previous manifest available.");
        }
      });

      next.addEventListener("click", () => {
        if (currentIndex < manifests.length - 1) {
          currentIndex++;
          loadImageFromManifest(manifests[currentIndex]);
        } else {
          console.log("No next manifest available.");
        }
      });
    } else {
      console.error("Navigation buttons not found.");
    }
  }

  function initializeFromHash() {
    const hash = window.location.hash.substring(1);
    if (hash) {
      const baseId = hash.split('_')[0] + '_' + hash.split('_')[1]; // Extract the base ID (e.g., facs_340)
      const targetElement = document.getElementById(hash);
      if (targetElement) {
        targetElement.scrollIntoView(); // Scroll the target element into view
        const pbElements = document.getElementsByClassName("pb");
        Array.from(pbElements).forEach((element, index) => {
          if (element.id === baseId) {
            currentIndex = index - 1; // Set to the previous pb element
            if (currentIndex < 0) currentIndex = 0; // Ensure index is not negative
            console.log(`Initialized currentIndex to ${currentIndex} based on hash ${hash}`); // Log initialization
          }
        });
      }
    }
  }

 function parseZonesFromXML(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    const hash = window.location.hash.substring(1);
    if (!hash) {
        console.log("No hash found in URL");
        return [];
    }

    console.log(`Looking for zone with id ${hash}`);

    // Extract the base ID (e.g., facs_152)
    const baseId = hash.split('_').slice(0, 2).join('_');
    console.log(`Looking for surface with id ${baseId}`);

    // Find all surface elements
    const surfaces = xmlDoc.getElementsByTagNameNS("*", "surface");
    let targetSurface = null;

    // Find the surface with matching xml:id
    for (let surface of surfaces) {
        if (surface.getAttributeNS("http://www.w3.org/XML/1998/namespace", "id") === baseId) {
            targetSurface = surface;
            break;
        }
    }

    if (!targetSurface) {
        console.log(`No surface found with id ${baseId}`);
        return [];
    }

    // Find the specific zone within the surface
    const zones = targetSurface.getElementsByTagNameNS("*", "zone");
    let targetZone = null;

    for (let zone of zones) {
        if (zone.getAttributeNS("http://www.w3.org/XML/1998/namespace", "id") === hash) {
            targetZone = zone;
            break;
        }
    }

    if (!targetZone) {
        // Try finding zone referenced by lb element
        const lbElement = xmlDoc.querySelector(`lb[facs='#${hash}']`);
        if (lbElement) {
            const referencedZoneId = lbElement.getAttribute('facs').substring(1);
            for (let zone of zones) {
                if (zone.getAttributeNS("http://www.w3.org/XML/1998/namespace", "id") === referencedZoneId) {
                    targetZone = zone;
                    break;
                }
            }
        }
    }

    if (!targetZone) {
        console.log(`No zone found with id ${hash}`);
        const availableZones = Array.from(zones).map(z => 
            z.getAttributeNS("http://www.w3.org/XML/1998/namespace", "id")
        );
        console.log("Available zones:", availableZones);
        return [];
    }

    // Get points from the target zone
    const points = targetZone.getAttribute("points").split(" ").map(point => {
        const [x, y] = point.split(",");
        return { x: parseInt(x, 10), y: parseInt(y, 10) };
    });

    console.log("Parsed points:", points);
    return [{ id: hash, points }];
}

function getIIIFImageDimensions(manifestUrl) {
  return fetch(manifestUrl)
    .then(response => response.json())
    .then(data => {
      const image = data.images[0];
      return {
        width: image.width || 2000,
        height: image.height || 2000
      };
    })
    .catch(() => ({ width: 2000, height: 2000 })); // fallback dimensions
}
function addZoneOverlays(zoneData) {
  if (!zoneData.length) return;
  
  viewer.clearOverlays();
  addSurfaceOverlay();
  
  zoneData.forEach(zone => {
    const points = zone.points;
    console.log("Original points:", points);
    
    // Base scaling that works for standard cases
    const scaledCoords = {
      minX: Math.min(...points.map(p => p.x)) / 2000,
      minY: Math.min(...points.map(p => p.y)) / 2000,
      maxX: Math.max(...points.map(p => p.x)) / 2000,
      maxY: Math.max(...points.map(p => p.y)) / 2000
    };

    // Only apply special scaling for coordinates > 2500
    const maxX = Math.max(...points.map(p => p.x));
    if (maxX > 2500) {
      scaledCoords.minX *= 0.6;
      scaledCoords.maxX *= 0.6;
      scaledCoords.minY *= 0.59;
      scaledCoords.maxY *= 0.59;
    }
    
    console.log("Test scaled coords:", scaledCoords);
    
    const width = scaledCoords.maxX - scaledCoords.minX;
    const height = scaledCoords.maxY - scaledCoords.minY;

    const overlay = document.createElement('div');
    overlay.style.border = '2px solid rgba(0,255,0,0.5)';
    overlay.style.background = 'rgba(0,255,0,0.2)';
    overlay.style.pointerEvents = 'none';
    overlay.style.position = 'absolute';
    
    viewer.addOverlay({
      element: overlay,
      location: new OpenSeadragon.Rect(scaledCoords.minX, scaledCoords.minY, width, height)
    });
  });
}

function loadAndParseXML(xmlFilePath) {
    fetch(xmlFilePath)
      .then(response => response.text())
      .then(xmlString => {
        console.log("XML loaded successfully"); // Log XML load success
        const zoneData = parseZonesFromXML(xmlString);
        addZoneOverlays(zoneData);
      })
      .catch(err => {
        console.error("Error loading XML file:", err);
      });
}

const iiifManifests = getIIIFManifests();
if (iiifManifests.length > 0) {
    initializeFromHash(); // Initialize currentIndex from URL hash
    loadImageFromManifest(iiifManifests[currentIndex]);
    setupNavigationButtons(iiifManifests);
    setupScrollNavigation();
    document.querySelector('#transcript').dispatchEvent(new Event('scroll')); // Trigger scroll event manually
}
});
