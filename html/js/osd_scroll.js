document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  let currentIndex = 0;
  let isManualNavigation = false;

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

  function loadImageFromManifest(manifestUrl) {
    fetch(manifestUrl)
      .then(response => response.json())
      .then(data => {
        const images = data.images || [];
        if (images.length > 0) {
          const optimizedImages = images.map(image => {
            if (typeof image === 'string') {
              return image.replace(/\/full\/[^\/]+\/default\.(jpg|png)$/, '/full/!600,600/0/default.$1');
            }
            return image;
          });

          viewer.tileSources = optimizedImages;
          viewer.open(optimizedImages[currentIndex]);
          refreshNavigationControls();
        } else {
          console.error("No valid tile sources found in manifest.");
        }
      })
      .catch(err => {
        console.error("Error loading IIIF manifest:", err);
      });
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
      const targetElement = document.getElementById(hash);
      if (targetElement) {
        targetElement.scrollIntoView(); // Scroll the target element into view
        const pbElements = document.getElementsByClassName("pb");
        Array.from(pbElements).forEach((element, index) => {
          if (element.id === hash) {
            currentIndex = index - 1; // Set to the previous pb element
            if (currentIndex < 0) currentIndex = 0; // Ensure index is not negative
            console.log(`Initialized currentIndex to ${currentIndex} based on hash ${hash}`); // Log initialization
          }
        });
      }
    }
  }

  const iiifManifests = getIIIFManifests();
  if (iiifManifests.length > 0) {
    initializeFromHash(); // Initialize currentIndex from URL hash
    loadImageFromManifest(iiifManifests[currentIndex]);
    setupNavigationButtons(iiifManifests);
    setupScrollNavigation();
    document.querySelector('#transcript').dispatchEvent(new Event('scroll')); // Trigger scroll event manually
  } else {
    console.error("No IIIF manifests found.");
  }
});