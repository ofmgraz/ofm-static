document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  let currentIndex = 0;

  const viewer = OpenSeadragon({
    id: 'container_facs_1',
    prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/',
    visibilityRatio: 1,
    sequenceMode: true, // Enable sequence navigation
    showNavigator: false,
    showSequenceControl: true, // Ensure sequence controls are shown
    showNavigationControl: true,
    constrainDuringPan: true,
    tileSources: [], // Initial tileSources can be empty; will be dynamically loaded
  });

  // Function to get IIIF manifests from elements with class 'pb'
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

  // Load an image using its IIIF manifest
  function loadImageFromManifest(manifestUrl) {
    fetch(manifestUrl)
      .then(response => response.json())
      .then(data => {
        const images = data.images || [];
        if (images.length > 0) {
          const optimizedImages = images.map(image => {
            // Modify each image's tileSource URL to request smaller images
            if (typeof image === 'string') {
              return image.replace(/\/full\/[^\/]+\/default\.(jpg|png)$/, '/full/!600,600/0/default.$1');
            }
            return image;
          });

          viewer.tileSources = optimizedImages; // Update viewer's tileSources
          viewer.open(optimizedImages[currentIndex]); // Open the current image
          refreshNavigationControls(); // Refresh navigation controls
        } else {
          console.error("No valid tile sources found in manifest.");
        }
      })
      .catch(err => {
        console.error("Error loading IIIF manifest:", err);
      });
  }

  // Refresh navigation button states
  function refreshNavigationControls() {
    if (viewer.previousButton) {
      viewer.previousButton.setDisabled(currentIndex === 0); // Disable 'Previous' if on the first image
    }
    if (viewer.nextButton) {
      viewer.nextButton.setDisabled(currentIndex === viewer.tileSources.length - 1); // Disable 'Next' if on the last image
    }
  }

  // Handle navigation buttons
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

  // Initialize viewer and load manifests
  const iiifManifests = getIIIFManifests();
  if (iiifManifests.length > 0) {
    loadImageFromManifest(iiifManifests[currentIndex]); // Load the first manifest
    setupNavigationButtons(iiifManifests); // Set up navigation buttons
  } else {
    console.error("No IIIF manifests found.");
  }
});
