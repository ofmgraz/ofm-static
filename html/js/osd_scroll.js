document.addEventListener("DOMContentLoaded", function () {
  let currentIndex = 0;

  // Function to get image URLs from elements with class 'pb'
  function getImageURLs() {
    const pbElements = document.getElementsByClassName("pb");
    const pbElementsArray = Array.from(pbElements);
    const imageURLs = [];

    pbElementsArray.forEach(function (el) {
      const img = el.getAttribute("source");
      const id = el.getAttribute("id");

      if (typeof img === 'string' && img.trim() !== '' && typeof id === 'string' && id.trim() !== '') {
        const imageURL = {
          type: "image",
          url: img,
          id: id // Add the id to the imageURL object
        };
        imageURLs.push(imageURL);
      } else {
        console.warn("Element does not have a valid 'source' attribute or 'id' attribute is missing or not a string:", el);
      }
    });

    return imageURLs;
  }

  // Extract the base ID from the URL fragment
  function getBaseIdFromFragment() {
    const fragment = window.location.hash.substring(1);
    const baseIdMatch = fragment.match(/^facs_\d+/);
    return baseIdMatch ? baseIdMatch[0] : null;
  }

  // Initialize the OpenSeadragon viewer
  function initializeViewer(imageURLs) {
    const baseId = getBaseIdFromFragment();
    console.log("Base ID from fragment:", baseId);

    currentIndex = imageURLs.findIndex((imageURL) => {
      // Use baseId to determine the initial image index
      return baseId === imageURL.id;
    });

    if (currentIndex === -1) {
      currentIndex = 0; // Default to the first image if baseId not found
    }

    loadImageByIndex(currentIndex);
  }

  // Load an image by index and fit it to the viewport
  function loadImageByIndex(index) {
    if (index >= 0 && index < imageURLs.length) {
      console.log("Loading image at index:", index, "URL:", imageURLs[index].url);

      if (viewer.world.getItemCount() > 0) {
        console.log("Removing old image from viewer.");
        viewer.world.removeItem(viewer.world.getItemAt(0));
      }

      viewer.addTiledImage({
        tileSource: { type: 'image', url: imageURLs[index].url },
        success: function (event) {
          console.log("Image loaded successfully:", event.item);
          fitToViewport(event.item); // Fit the image to the viewport
        },
        error: function (event) {
          console.error("Failed to load image:", event);
        }
      });

      viewer.forceResize();
    } else {
      console.error("Index out of bounds:", index);
    }
  }

  // Fit the loaded image to the viewport
  function fitToViewport(item) {
    // Get the image bounds
    const bounds = item.getBounds();
    // Fit the bounds to the viewport
    viewer.viewport.fitBounds(bounds, true); // true for animate
  }

  // Handle button clicks to navigate through images
  function setupNavigationButtons() {
    const prev = document.querySelector("div[title='Previous page']");
    const next = document.querySelector("div[title='Next page']");

    if (prev && next) {
      prev.addEventListener("click", () => {
        if (currentIndex > 0) {
          currentIndex--;
          loadImageByIndex(currentIndex);
        } else {
          console.log("No previous image available.");
        }
      });

      next.addEventListener("click", () => {
        if (currentIndex < imageURLs.length - 1) {
          currentIndex++;
          loadImageByIndex(currentIndex);
        } else {
          console.log("No next image available.");
        }
      });
    } else {
      console.error("Navigation buttons not found.");
    }
  }

  // Initialize viewer and get image URLs
  const imageURLs = getImageURLs();
  const viewer = new OpenSeadragon.Viewer({
    id: 'container_facs_1',
    prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/',
    visibilityRatio: 1,
    sequenceMode: true,
    showNavigator: false,
    showNavigationControl: true,
    showSequenceControl: true,
    showZoomControl: true,
    constrainDuringPan: true,
    tileSources: imageURLs // Remove this line if you load images by index
  });

  // Initialize viewer based on URL fragment
  initializeViewer(imageURLs);
  setupNavigationButtons();
});
