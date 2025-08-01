document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  /**
   * ManuscriptViewer - A class-based approach for better organization
   */
  class ManuscriptViewer {
    constructor() {
      this.currentIndex = 0;
      this.isManualNavigation = false;
      this.overlayShown = false;
      this.currentImageBounds = null;
      this.currentImageDimensions = null;
      this.iiifManifests = [];
      this.validImageTileSources = []; // Store valid images for navigation
      this.singleImageMode = false; // Flag to track if we're in single image mode (due to CORS)
      
      // Lazy loading properties
      this.allImages = [];
      this.loadedManifestCount = 0;
      this.initialBatchSize = 5;  // Initial batch size
      this.additionalBatchSize = 10; // Number of additional manifests to load each time
      this.successCount = 0;
      this.errorCount = 0;

      this.paragraphs = document.querySelectorAll("ab[data-target]");
      this.imageRegions = document.querySelectorAll(".image-region");

      this.init();
    }

    init() {
      this.setupViewer();
      this.iiifManifests = this.getIIIFManifests();

      if (this.iiifManifests.length > 0) {
        this.initializeFromHash();
        // Load the first manifest directly instead of batch loading
        this.loadImageFromManifest(this.iiifManifests[this.currentIndex]);
        this.setupNavigationButtons();
        this.setupPageNavigation();
        this.setupParagraphHighlighting();
        this.setupKeyboardNavigation(); // Add keyboard navigation

        // Trigger initial page display after a brief delay to ensure everything is loaded
        setTimeout(() => {
          this.showOnlyCurrentPage(this.currentIndex);
          // Reset view and refresh overlays
          setTimeout(() => {
            this.viewer.viewport.goHome();
            this.refreshOverlays();
          }, 100);
        }, 500);
      }
    }

    setupViewer() {
      this.viewer = OpenSeadragon({
        id: "container_facs_1",
        prefixUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/",
        visibilityRatio: 1,
        sequenceMode: true,
        showNavigator: false,
        showSequenceControl: true,
        showNavigationControl: true,
        constrainDuringPan: true,
        tileSources: [],
      });

      this.viewer.addHandler("open", () => this.onImageOpen());
      
      // Add handler specifically for tile sources loading
      this.viewer.addHandler("tile-loaded", (event) => {
        // This confirms tiles are actually loading correctly
        console.log(`🧩 Tile loaded for page ${this.currentIndex}, level: ${event.tiledImage.source.tileSize}`);
      });
      
      // Add handler for when item visibility changes
      this.viewer.world.addHandler("item-index-change", (event) => {
        console.log("🔄 Item index change:", event);
        // Refresh the overlays when image changes
        setTimeout(() => {
          if (this.viewer.world.getItemCount() > 0) {
            const imageSize = this.viewer.world.getItemAt(0).getContentSize();
            console.log(`📏 New image dimensions: ${imageSize.x} × ${imageSize.y}`);
            this.onImageOpen();
          }
        }, 100);
      });
      
      // Add handler for page changes (when user clicks navigation buttons)
      this.viewer.addHandler("page", (event) => {
        console.log("📄 OpenSeadragon page event:", event.page);
        this.currentIndex = event.page;
        
        // Update text content
        this.showOnlyCurrentPage(this.currentIndex);
        
        // Reset the viewport
        this.viewer.viewport.goHome();
        this.refreshOverlays();
        this.refreshNavigationControls();
      });
    }

    onImageOpen() {
      console.log("🔍 onImageOpen called");
      
      if (this.viewer.world.getItemCount() === 0) {
        console.warn("⚠️ No items in the viewer world on open");
        return; // Don't proceed if there are no items
      }
      
      const currentItem = this.viewer.world.getItemAt(0);
      if (!currentItem) {
        console.warn("⚠️ No current item available");
        return;
      }
      
      try {
        const imageSize = currentItem.getContentSize();
        const imageWidth = imageSize.x;
        const imageHeight = imageSize.y;
        
        console.log(`📏 Image dimensions: ${imageWidth} × ${imageHeight}`);
        
        // Log current state for debugging
        console.log(`Current page: ${this.viewer.currentPage()}`);
        console.log(`Current index in our tracking: ${this.currentIndex}`);
        
        this.addSurfaceOverlay();
        this.addImageRegionOverlays(imageWidth, imageHeight);
        this.setupHoverOverlays(imageWidth, imageHeight);
        
        // Handle hash-based zone highlighting
        const hash = window.location.hash.substring(1);
        if (hash) {
          const xmlPath = window.location.pathname.replace(".html", ".xml");
          this.loadAndParseXML(xmlPath);
        }
      } catch (err) {
        console.error("Error in onImageOpen:", err);
      }
    }

    addSurfaceOverlay() {
      const overlay = document.createElement("div");
      overlay.style.position = "absolute";
      overlay.style.pointerEvents = "none";

      const currentImage = this.viewer.world.getItemAt(0);
      if (currentImage) {
        this.currentImageBounds = currentImage.getBounds();
        this.viewer.addOverlay({
          element: overlay,
          location: this.currentImageBounds,
        });
      }
    }

    addImageRegionOverlays(imageWidth, imageHeight) {
      this.imageRegions.forEach((region) => {
        const pointsStr = region.getAttribute("data-points");
        if (!pointsStr) return;

        const box = this.parsePolygonBoundingBox(pointsStr);
        if (!box) return;

        const normalizedBox = {
          x: box.left / imageWidth,
          y: box.top / imageHeight,
          width: box.width / imageWidth,
          height: box.height / imageHeight,
        };

        const overlay = this.createRegionOverlay(region);

        this.viewer.addOverlay({
          element: overlay,
          location: new OpenSeadragon.Rect(
            normalizedBox.x,
            normalizedBox.y,
            normalizedBox.width,
            normalizedBox.height
          ),
        });
      });
    }

    createRegionOverlay(region) {
      const overlay = document.createElement("div");
      overlay.className = "image-region";
      overlay.id = region.id;
      overlay.setAttribute("data-target", region.getAttribute("data-target"));

      // Styling
      overlay.style.border = "2px solid red";
      overlay.style.background = "rgba(255,0,0,0.1)";

      // Event handlers
      overlay.addEventListener("mouseenter", () =>
        this.toggleHighlight(overlay, true)
      );
      overlay.addEventListener("mouseleave", () =>
        this.toggleHighlight(overlay, false)
      );

      return overlay;
    }

    setupHoverOverlays(imageWidth, imageHeight) {
      document
        .querySelectorAll("ab[data-points], br[data-points]")
        .forEach((el) => {
          el.addEventListener("mouseenter", () => {
            this.showHoverOverlay(
              el.getAttribute("data-points"),
              imageWidth,
              imageHeight
            );
          });
          el.addEventListener("mouseleave", () => {
            this.removeHoverOverlay();
          });
        });
    }

    setupParagraphHighlighting() {
      this.paragraphs.forEach((p) => {
        p.addEventListener("mouseenter", () => this.toggleHighlight(p, true));
        p.addEventListener("mouseleave", () => this.toggleHighlight(p, false));
      });
    }

    toggleHighlight(element, add) {
      const targetId = element.getAttribute("data-target");
      element.classList.toggle("highlight", add);

      const twin = document.getElementById(targetId);
      if (twin) {
        twin.classList.toggle("highlight", add);
      }
    }

    parsePolygonBoundingBox(pointsStr) {
      const points = pointsStr
        .trim()
        .split(/\s+/)
        .map((pt) => pt.split(",").map(Number));
      if (points.length < 2) return null;

      const xs = points.map((p) => p[0]);
      const ys = points.map((p) => p[1]);

      return {
        left: Math.min(...xs),
        top: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
      };
    }

    getIIIFManifests() {
      
      const pbElements = document.getElementsByClassName("pb");
      const manifests = [];
      Array.from(pbElements).forEach((el, index) => {
        const imgSource = el.getAttribute("source");
        if (imgSource) {
          // Clean the imgSource - remove duplicate URLs and trim whitespace
          const cleanedSource = imgSource.trim().split(/\s+/)[0]; // Take only the first URL if there are multiple
          
          // Validate that it looks like a proper URL
          if (cleanedSource.startsWith('http')) {
            const manifestUrl = `https://arche-iiifmanifest.acdh.oeaw.ac.at/?id=${encodeURIComponent(
              cleanedSource
            )}&mode=images`;
            manifests.push(manifestUrl);
            console.log(`Page ${index}: pb.id=${el.id}, source=${cleanedSource}`);
            console.log(`Generated manifest URL: ${manifestUrl}`);
          } else {
            console.warn(`Invalid source URL format for element ${el.id}:`, imgSource);
          }
        } else {
          console.warn("No 'source' attribute found for element:", el);
        }
      });
      console.log(`Total manifests: ${manifests.length}, Total pb elements: ${pbElements.length}`);
      
      // Log first few manifest URLs for debugging
      console.log("First 3 manifest URLs:");
      manifests.slice(0, 3).forEach((url, index) => {
        console.log(`  ${index + 1}: ${url}`);
      });
      
      return manifests;
    }

    async loadAllManifests() {
      console.log("🔄 Loading manifests in batches for better performance...");
      
      // Check if we're running locally 
      const isLocalDev = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' || 
                        window.location.hostname === '0.0.0.0';
      
      // In local development, we'll still try to load images normally
      // rather than immediately switching to single image mode
      
      // Skip the connectivity test as it's causing CORS issues
      // We'll directly attempt to load the manifests and handle errors as they occur
      console.log("🔍 Local development detected - skipping connectivity test and proceeding to load manifests directly");
      
      // Set a flag to track if we need to fall back to placeholders for local development
      let useLocalPlaceholders = false;
      
      // Initialize image storage
      this.allImages = [];
      this.loadedManifestCount = 0;
      this.initialBatchSize = 5;  // Initial batch size
      this.additionalBatchSize = 10; // Number of additional manifests to load each time
      this.successCount = 0;
      this.errorCount = 0;
      
      // Load the initial batch of manifests
      await this.loadManifestBatch(0, this.initialBatchSize);
    }
    
    // Load a batch of manifests starting from startIndex up to startIndex + batchSize
    async loadManifestBatch(startIndex, batchSize) {
      console.log(`🔄 Loading manifest batch from ${startIndex} to ${Math.min(startIndex + batchSize, this.iiifManifests.length) - 1}`);
      
      const isLocalDev = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' || 
                         window.location.hostname === '0.0.0.0';
      
      const endIndex = Math.min(startIndex + batchSize, this.iiifManifests.length);
      let batchSuccessCount = 0;
      let batchErrorCount = 0;
      
      // Load the specified batch of manifests
      for (let i = startIndex; i < endIndex; i++) {
        const manifestUrl = this.iiifManifests[i];
        console.log(`Loading manifest ${i + 1}/${this.iiifManifests.length}`);
        console.log(`URL: ${manifestUrl}`);
        
        try {
          const response = await fetch(manifestUrl);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Log the first part of the manifest structure to understand what we're getting
          console.log(`Manifest data for index ${i}:`, JSON.stringify(data).substring(0, 200) + "...");
          
          // Check if we have a proper IIIF manifest with sequence/canvases structure
          if (data.sequences && data.sequences[0] && data.sequences[0].canvases) {
            console.log(`✅ Found standard IIIF manifest structure with ${data.sequences[0].canvases.length} canvases`);
            
            // Get the first canvas
            const canvas = data.sequences[0].canvases[0];
            
            // Extract the image from the canvas
            if (canvas.images && canvas.images[0] && canvas.images[0].resource) {
              const resource = canvas.images[0].resource;
              
              // Get the service URL which provides the IIIF image API
              if (resource.service && resource.service['@id']) {
                // This is the base IIIF image URL we need
                const iiifBaseUrl = resource.service['@id'];
                console.log(`Found IIIF image service URL: ${iiifBaseUrl}`);
                
                // Create a fully qualified IIIF URL with size parameters
                const fullImageUrl = `${iiifBaseUrl}/full/600,/0/default.jpg?uniqueId=${i}-${Date.now()}`;
                this.allImages[i] = fullImageUrl;
                batchSuccessCount++;
                this.successCount++;
                console.log(`✅ Created optimized IIIF URL: ${fullImageUrl}`);
                continue; // Skip to next iteration
              }
            }
          }
          
          // Fall back to the older/simpler format if we didn't find the standard structure
          const images = data.images || [];
          
          if (images.length > 0) {
            // Use smaller image size for faster loading
            // Make sure we're using the proper info URL if it's available
            let optimizedImage;
            
            if (typeof images[0] === "string") {
              // If it's a direct URL string, use it with size optimization
              optimizedImage = images[0].replace(/\/full\/[^\/]+\/default\.(jpg|png)$/, "/full/!400,400/0/default.$1");
              console.log(`Direct URL for manifest ${i + 1}: ${optimizedImage.substring(0, 100)}...`);
            } else if (images[0].url) {
              // If it has a URL property, use that with size optimization
              optimizedImage = images[0].url.replace(/\/full\/[^\/]+\/default\.(jpg|png)$/, "/full/!400,400/0/default.$1");
              console.log(`URL property for manifest ${i + 1}: ${optimizedImage.substring(0, 100)}...`);
            } else if (images[0]["@id"]) {
              // Some IIIF manifests use @id for the image URL
              optimizedImage = images[0]["@id"].replace(/\/full\/[^\/]+\/default\.(jpg|png)$/, "/full/!400,400/0/default.$1");
              console.log(`@id property for manifest ${i + 1}: ${optimizedImage.substring(0, 100)}...`);
            } else {
              // Use the image info.json URL directly - this is the most reliable way to load IIIF images
              optimizedImage = {
                tileSource: images[0],
                // Add a page indicator to make each source unique
                id: `page-${i}`
              };
              console.log(`Using tileSource for manifest ${i + 1}`);
            }
            
            // CRITICAL: Make sure each URL is completely unique with timestamp
            if (typeof optimizedImage === "string") {
              // Strip any existing query parameters and add our own with timestamp
              const baseUrl = optimizedImage.split('?')[0];
              optimizedImage = `${baseUrl}?page=${i}&t=${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
              console.log(`Final unique URL: ${optimizedImage.substring(0, 100)}...`);
            } else if (optimizedImage && optimizedImage.id) {
              // Ensure object IDs are also unique
              optimizedImage.id = `page-${i}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
            }
            
            this.allImages[i] = optimizedImage;
            batchSuccessCount++;
            this.successCount++;
            console.log(`✅ Manifest ${i + 1} loaded successfully`);
          } else {
            console.warn(`⚠️ No images found in manifest ${i + 1}: ${manifestUrl}`);
            // Add a placeholder to maintain index alignment
            this.allImages[i] = null;
          }
        } catch (err) {
          console.error(`❌ Error loading manifest ${i + 1}:`, err.message);
          console.error(`❌ Full error:`, err);
          batchErrorCount++;
          this.errorCount++;
          
          // Check if we're in local development
          if (isLocalDev) {
            console.log(`🏠 Local development - creating placeholder for manifest ${i + 1}`);
            // Add a placeholder to maintain index alignment
            this.allImages[i] = `placeholder:${i}`;
          } else if (err.name === 'NetworkError' || err.message.includes('CORS') || err.message.includes('fetch')) {
            console.log("🔄 NetworkError detected - this is likely a CORS issue");
            console.log("🔄 Switching to single image mode for better compatibility...");
            this.loadImageFromManifest(this.iiifManifests[this.currentIndex]);
            return false;
          } else {
            // Add a placeholder to maintain index alignment
            this.allImages[i] = null;
          }
        }
        
        // If we have too many consecutive failures at the start, break and use fallback
        if (i < 5 && batchErrorCount > 3) {
          console.log("🔄 Too many early failures, switching to fallback mode...");
          this.loadImageFromManifest(this.iiifManifests[this.currentIndex]);
          return false;
        }
      }
      
      this.loadedManifestCount = endIndex;
      console.log(`✅ Batch loaded: ${batchSuccessCount} successful, ${batchErrorCount} errors`);
      
      // Filter out null placeholders for the valid image array
      const validImages = this.allImages.filter(img => img !== null);
      
      // Update the viewer with the newly loaded images
      this.updateViewerWithImages(validImages, isLocalDev);
      
      return true;
    }

    // Check if we need to load more manifests based on current index
    checkAndLoadMoreManifests() {
      // If we're at the 4th to last loaded manifest, load more
      if (this.currentIndex >= this.loadedManifestCount - 4 && 
          this.loadedManifestCount < this.iiifManifests.length) {
        console.log(`🔄 Near the end of loaded manifests (${this.currentIndex}/${this.loadedManifestCount}), loading more...`);
        this.loadManifestBatch(this.loadedManifestCount, this.additionalBatchSize);
      }
    }

    updateViewerWithImages(validImages, isLocalDev) {
      if (validImages.length === 0) {
        console.error("No valid images loaded, falling back to single image mode");
        // Fallback to single manifest loading
        this.loadImageFromManifest(this.iiifManifests[this.currentIndex]);
        return;
      }
      
      // Process the images for viewer
      const processedImages = validImages.map((img, idx) => {
        if (img === undefined || img === null) {
          return this.createPlaceholderTileSource(idx);
        }
        
        // Direct image URL handling
        if (typeof img === 'string') {
          if (img.startsWith('placeholder:')) {
            return this.createPlaceholderTileSource(parseInt(img.split(':')[1]));
          }
          // Ensure the URL is completely unique by adding a timestamp and random ID
          const baseUrl = img.split('?')[0];
          return `${baseUrl}?idx=${idx}&t=${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        } 
        // Object with URL property
        else if (img.url) {
          const baseUrl = img.url.split('?')[0];
          return `${baseUrl}?idx=${idx}&t=${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        } 
        // IIIF objects with @id
        else if (img['@id']) {
          const baseUrl = img['@id'].split('?')[0];
          return `${baseUrl}?idx=${idx}&t=${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        } 
        // Use existing tile source objects, but ensure they have unique IDs
        else if (img.tileSource) {
          return {
            tileSource: img.tileSource,
            id: `unique-${idx}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`
          };
        }
        // Fallback to placeholder
        else {
          console.warn(`Warning: Unsupported image format at index ${idx}, creating placeholder`);
          return this.createPlaceholderTileSource(idx);
        }
      });
      
      // Configure OpenSeadragon with sequence mode
      this.viewer.sequenceMode = true;
      
      // Set reference strip configuration
      this.viewer.referenceStripScroll = 'horizontal';
      this.viewer.showReferenceStrip = true;
      
      // Store the processed images for reference
      this.validImageTileSources = processedImages;
      
      // Close the viewer first if it's already open
      if (this.viewer.isOpen()) {
        this.viewer.close();
      }
      
      // Open with the array of processed image URLs
      this.viewer.open(processedImages);
      
      console.log(`✅ Opened viewer with ${processedImages.length} images, current page: ${this.currentIndex}`);
      
      // Call diagnostic function to verify image sequence
      setTimeout(() => this.checkCurrentImage(), 500);
      
      // Navigate to the correct page after a brief delay
      if (this.currentIndex > 0) {
        setTimeout(() => {
          console.log(`Navigating to page ${this.currentIndex} of ${validImages.length}`);
          this.viewer.goToPage(this.currentIndex);
          console.log(`✅ Navigated to page ${this.currentIndex}`);
        }, 200);
      }
    }

    async loadImageFromManifest(manifestUrl) {
      console.log(`🔍 Loading image for index ${this.currentIndex}, URL: ${manifestUrl}`);
      
      try {
        const response = await fetch(manifestUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const images = data.images || [];
        
        if (images.length === 0) {
          console.warn("No valid images found in manifest:", manifestUrl);
          this.createPlaceholderImage();
          return;
        }

        // Process all images - similar to what iiif.js does
        const optimizedImages = images.map(image => {
          if (typeof image === 'string') {
            return image.replace(/\/full\/[^\/]+\/default\.(jpg|png)$/, '/full/!600,600/0/default.$1');
          }
          return image;
        });

        console.log(`Found ${optimizedImages.length} images in manifest`);

        // Set the tile sources in the viewer
        this.viewer.tileSources = optimizedImages;
        
        // Open the current image
        this.viewer.open(optimizedImages);
        
        // Refresh navigation controls
        this.refreshNavigationControls();
        
        console.log(`✅ Images loaded successfully`);
      } catch (err) {
        console.error("Error loading IIIF manifest:", err);
        this.createPlaceholderImage();
      }
    }

    createPlaceholderTileSource(index) {
      console.log(`🎨 Creating placeholder tile source for page ${index + 1}`);
      
      // Create a simple colored square as a lightweight placeholder
      const size = 400;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      // Use different colors for different pages to make navigation more obvious
      const colors = ['#e8f4f8', '#f8e8e8', '#e8f8e8', '#f8f4e8', '#f4e8f8'];
      const bgColor = colors[index % colors.length];
      
      // Draw background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);
      
      // Draw border
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 3;
      ctx.strokeRect(5, 5, size - 10, size - 10);
      
      // Draw page number (large)
      ctx.fillStyle = '#333';
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${index + 1}`, size / 2, size / 2 - 20);
      
      // Draw label (smaller)
      ctx.font = '20px Arial';
      ctx.fillText('Facsimile Page', size / 2, size / 2 + 40);
      
      // Create a simple tile source object that OpenSeadragon can handle
      return {
        type: 'image',
        url: canvas.toDataURL('image/png'),
        buildPyramid: false
      };
    }

    createPlaceholderImage() {
      console.log(`🎨 Creating placeholder image for page ${this.currentIndex + 1}`);
      
      // Create tile source
      const tileSource = this.createPlaceholderTileSource(this.currentIndex);
      
      // Clear the viewer first to ensure clean transition
      if (this.viewer.isOpen()) {
        this.viewer.close();
      }
      
      // Load the placeholder image with a slight delay to ensure proper loading
      setTimeout(() => {
        this.viewer.sequenceMode = false;
        this.viewer.open(tileSource);
        this.singleImageMode = true;
        this.refreshNavigationControls();
      }, 50);
      
      console.log(`✅ Placeholder image created for page ${this.currentIndex + 1}`);
    }

    refreshNavigationControls() {
      const prev = document.querySelector("div[title='Previous page']");
      const next = document.querySelector("div[title='Next page']");
      
      if (prev && next) {
        prev.style.pointerEvents = this.currentIndex === 0 ? 'none' : 'auto';
        prev.style.opacity = this.currentIndex === 0 ? '0.5' : '1';
        
        next.style.pointerEvents = this.currentIndex === this.viewer.tileSources.length - 1 ? 'none' : 'auto';
        next.style.opacity = this.currentIndex === this.viewer.tileSources.length - 1 ? '0.5' : '1';
      }
    }

    setupNavigationButtons() {
      // Try to find OpenSeadragon navigation buttons with retry logic
      let attemptCount = 0;
      const maxAttempts = 20; // 2 seconds max wait
      
      const findButtons = () => {
        const prev = document.querySelector("div[title='Previous page']");
        const next = document.querySelector("div[title='Next page']");
        
        console.log(`🔍 Attempt ${attemptCount + 1}: Navigation buttons found:`, { prev: !!prev, next: !!next });
        
        if (prev && next) {
          console.log("✅ Setting up OpenSeadragon navigation button event listeners");
          
          // Set initial opacity to fully visible
          prev.style.opacity = "1";
          next.style.opacity = "1";
          
          // The sequence mode navigation buttons already work, we just need to add our page text sync
          prev.addEventListener("click", (e) => {
            console.log("🔙 PREV button clicked - current index:", this.currentIndex);
            // Let OpenSeadragon handle the navigation, we'll catch it in the page event
          });

          next.addEventListener("click", (e) => {
            console.log("▶️ NEXT button clicked - current index:", this.currentIndex);
            // Let OpenSeadragon handle the navigation, we'll catch it in the page event
          });
          
          return true;
        } else {
          attemptCount++;
          if (attemptCount < maxAttempts) {
            setTimeout(findButtons, 100);
            return false;
          } else {
            console.log("🔍 OpenSeadragon navigation buttons not found after retries, creating fallback navigation");
            this.createCustomNavigationButtons();
            return true;
          }
        }
      };
      
      findButtons();
    }

    createCustomNavigationButtons() {
      const viewerContainer = document.getElementById("container_facs_1");
      if (!viewerContainer) return;

      // Create previous button
      const prevBtn = document.createElement("button");
      prevBtn.innerHTML = "◀ Previous";
      prevBtn.style.position = "absolute";
      prevBtn.style.top = "10px";
      prevBtn.style.left = "10px";
      prevBtn.style.zIndex = "1000";
      prevBtn.style.padding = "8px 12px";
      prevBtn.style.backgroundColor = "rgba(0,0,0,0.7)";
      prevBtn.style.color = "white";
      prevBtn.style.border = "none";
      prevBtn.style.borderRadius = "4px";
      prevBtn.style.cursor = "pointer";

      // Create next button
      const nextBtn = document.createElement("button");
      nextBtn.innerHTML = "Next ▶";
      nextBtn.style.position = "absolute";
      nextBtn.style.top = "10px";
      nextBtn.style.right = "10px";
      nextBtn.style.zIndex = "1000";
      nextBtn.style.padding = "8px 12px";
      nextBtn.style.backgroundColor = "rgba(0,0,0,0.7)";
      nextBtn.style.color = "white";
      nextBtn.style.border = "none";
      nextBtn.style.borderRadius = "4px";
      nextBtn.style.cursor = "pointer";

      // Add event listeners
      prevBtn.addEventListener("click", () => {
        console.log("🔙 Custom PREV button clicked - current index:", this.currentIndex);
        if (this.currentIndex > 0) {
          this.currentIndex--;
          console.log("🔙 Moving to index:", this.currentIndex);
          
          if (this.singleImageMode) {
            // In single image mode, load the manifest directly
            this.loadImageFromManifest(this.iiifManifests[this.currentIndex]);
          } else {
            // In sequence mode, let OpenSeadragon handle it
            console.log(`🔙 Custom PREV navigation to page ${this.currentIndex}`);
            this.viewer.goToPage(this.currentIndex);
            
            // Reset view and refresh overlays
            setTimeout(() => {
              this.viewer.viewport.goHome();
              this.refreshOverlays();
            }, 100);
          }
          this.showOnlyCurrentPage(this.currentIndex);
          this.updateCustomButtonStates(prevBtn, nextBtn);
        }
      });

      nextBtn.addEventListener("click", () => {
        console.log("▶️ Custom NEXT button clicked - current index:", this.currentIndex);
        if (this.currentIndex < this.iiifManifests.length - 1) {
          this.currentIndex++;
          console.log("▶️ Moving to index:", this.currentIndex);
          
          // Check if we need to load more manifests
          this.checkAndLoadMoreManifests();
          
          if (this.singleImageMode) {
            // In single image mode, load the manifest directly
            this.loadImageFromManifest(this.iiifManifests[this.currentIndex]);
          } else {
            // In sequence mode, let OpenSeadragon handle it
            console.log(`▶️ Custom NEXT navigation to page ${this.currentIndex}`);
            this.viewer.goToPage(this.currentIndex);
            
            // Reset view and refresh overlays
            setTimeout(() => {
              this.viewer.viewport.goHome();
              this.refreshOverlays();
            }, 100);
          }
          this.showOnlyCurrentPage(this.currentIndex);
          this.updateCustomButtonStates(prevBtn, nextBtn);
        }
      });

      // Add buttons to container
      viewerContainer.appendChild(prevBtn);
      viewerContainer.appendChild(nextBtn);

      // Store references for later updates
      this.customPrevBtn = prevBtn;
      this.customNextBtn = nextBtn;

      // Set initial button states
      this.updateCustomButtonStates(prevBtn, nextBtn);
    }

    updateCustomButtonStates(prevBtn, nextBtn) {
      const isFirstPage = this.currentIndex === 0;
      const isLastPage = this.currentIndex === this.iiifManifests.length - 1;

      prevBtn.style.opacity = isFirstPage ? "0.5" : "1";
      prevBtn.style.pointerEvents = isFirstPage ? "none" : "auto";

      nextBtn.style.opacity = isLastPage ? "0.5" : "1";
      nextBtn.style.pointerEvents = isLastPage ? "none" : "auto";

      // Update page indicator
      prevBtn.title = `Previous page (${this.currentIndex}/${this.iiifManifests.length})`;
      nextBtn.title = `Next page (${this.currentIndex + 2}/${this.iiifManifests.length})`;
    }

    setupKeyboardNavigation() {
      document.addEventListener("keydown", (event) => {
        // Only handle navigation when not typing in an input field
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
          return;
        }
        
        switch(event.key) {
          case 'ArrowLeft':
          case 'ArrowUp':
            event.preventDefault();
            if (this.currentIndex > 0) {
              this.currentIndex--;
              console.log("🔙 Keyboard navigation to index:", this.currentIndex);
              
              if (this.singleImageMode) {
                // In single image mode, load the manifest directly
                this.loadImageFromManifest(this.iiifManifests[this.currentIndex]);
              } else {
                // In sequence mode, let OpenSeadragon handle it
                this.viewer.goToPage(this.currentIndex);
                
                // Reset view and refresh overlays
                setTimeout(() => {
                  this.viewer.viewport.goHome();
                  this.refreshOverlays();
                }, 100);
              }
              this.showOnlyCurrentPage(this.currentIndex);
            }
            break;
            
          case 'ArrowRight':
          case 'ArrowDown':
          case ' ': // Spacebar
            event.preventDefault();
            if (this.currentIndex < this.iiifManifests.length - 1) {
              this.currentIndex++;
              console.log("▶️ Keyboard navigation to index:", this.currentIndex);
              
              // Check if we need to load more manifests
              this.checkAndLoadMoreManifests();
              
              if (this.singleImageMode) {
                // In single image mode, load the manifest directly
                this.loadImageFromManifest(this.iiifManifests[this.currentIndex]);
              } else {
                // In sequence mode, let OpenSeadragon handle it
                console.log(`⌨️ Keyboard navigation (next) to page ${this.currentIndex}`);
                this.viewer.goToPage(this.currentIndex);
                
                // Reset view and refresh overlays
                setTimeout(() => {
                  this.viewer.viewport.goHome();
                  this.refreshOverlays();
                }, 100);
              }
              this.showOnlyCurrentPage(this.currentIndex);
            }
            break;
            
          case 'Home':
            event.preventDefault();
            this.currentIndex = 0;
            console.log("🏠 Keyboard navigation to HOME (index 0)");
            
            if (this.singleImageMode) {
              // In single image mode, load the manifest directly
              this.loadImageFromManifest(this.iiifManifests[this.currentIndex]);
            } else {
              // In sequence mode, let OpenSeadragon handle it
              this.viewer.goToPage(this.currentIndex);
              
              // Reset view and refresh overlays
              setTimeout(() => {
                this.viewer.viewport.goHome();
                this.refreshOverlays();
              }, 100);
            }
            this.showOnlyCurrentPage(this.currentIndex);
            break;
            
          case 'End':
            event.preventDefault();
            this.currentIndex = this.iiifManifests.length - 1;
            console.log("🔚 Keyboard navigation to END (index", this.currentIndex, ")");
            
            // When jumping to the end, make sure all manifests are loaded
            if (this.loadedManifestCount < this.iiifManifests.length) {
              console.log("Loading all remaining manifests for END navigation");
              this.loadManifestBatch(this.loadedManifestCount, this.iiifManifests.length - this.loadedManifestCount);
            }
            
            if (this.singleImageMode) {
              // In single image mode, load the manifest directly
              this.loadImageFromManifest(this.iiifManifests[this.currentIndex]);
            } else {
              // In sequence mode, let OpenSeadragon handle it
              this.viewer.goToPage(this.currentIndex);
              
              // Reset view and refresh overlays
              setTimeout(() => {
                this.viewer.viewport.goHome();
                this.refreshOverlays();
              }, 100);
            }
            this.showOnlyCurrentPage(this.currentIndex);
            break;
        }
      });
    }

    setupPageNavigation() {
      // Initialize page view - show only the first page content
      this.initializePageView();
    }

    initializeFromHash() {
      
      const hash = window.location.hash.substring(1);
      if (!hash) {
        // If no hash, ensure we start at index 0
        this.currentIndex = 0;
        return;
      }

      const baseId = hash.split("_").slice(0, 2).join("_");
      const targetElement = document.getElementById(hash);

      if (targetElement) {
        targetElement.scrollIntoView();

        const pbElements = document.getElementsByClassName("pb");
        let foundIndex = -1;

        Array.from(pbElements).forEach((element, index) => {
          if (element.id === baseId) {
            foundIndex = index;
          }
        });

        // Set currentIndex to the found index, or 0 if not found
        this.currentIndex = foundIndex >= 0 ? foundIndex : 0;
      } else {
        // If hash exists but element not found, start at index 0
        this.currentIndex = 0;
      }
    }

    parseZonesFromXML(xmlString) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      const hash = window.location.hash.substring(1);

      if (!hash) return [];

      const baseId = hash.split("_").slice(0, 2).join("_");
      const surfaces = xmlDoc.getElementsByTagNameNS("*", "surface");

      let targetSurface = null;
      for (let surface of surfaces) {
        if (
          surface.getAttributeNS(
            "http://www.w3.org/XML/1998/namespace",
            "id"
          ) === baseId
        ) {
          targetSurface = surface;
          break;
        }
      }

      if (!targetSurface) return [];

      const zones = targetSurface.getElementsByTagNameNS("*", "zone");
      let targetZone = null;

      // Find zone by hash ID
      for (let zone of zones) {
        if (
          zone.getAttributeNS("http://www.w3.org/XML/1998/namespace", "id") ===
          hash
        ) {
          targetZone = zone;
          break;
        }
      }

      // Fallback: find zone referenced by lb element
      if (!targetZone) {
        const lbElement = xmlDoc.querySelector(`lb[facs='#${hash}']`);
        if (lbElement) {
          const referencedZoneId = lbElement.getAttribute("facs").substring(1);
          for (let zone of zones) {
            if (
              zone.getAttributeNS(
                "http://www.w3.org/XML/1998/namespace",
                "id"
              ) === referencedZoneId
            ) {
              targetZone = zone;
              break;
            }
          }
        }
      }

      if (!targetZone) return [];

      const points = targetZone
        .getAttribute("points")
        .split(" ")
        .map((point) => {
          const [x, y] = point.split(",");
          return { x: parseInt(x, 10), y: parseInt(y, 10) };
        });

      return [{ id: hash, points }];
    }

    addZoneOverlays(zoneData) {
      if (!zoneData.length) return;

      this.viewer.clearOverlays();
      this.addSurfaceOverlay();

      zoneData.forEach((zone) => {
        const points = zone.points;
        const scaledCoords = this.calculateScaledCoordinates(points);

        const overlay = document.createElement("div");
        overlay.style.border = "2px solid rgba(0,255,0,0.5)";
        overlay.style.background = "rgba(0,255,0,0.2)";
        overlay.style.pointerEvents = "none";
        overlay.style.position = "absolute";

        this.viewer.addOverlay({
          element: overlay,
          location: new OpenSeadragon.Rect(
            scaledCoords.x,
            scaledCoords.y,
            scaledCoords.width,
            scaledCoords.height
          ),
        });
      });
    }

    calculateScaledCoordinates(points) {
      const scaleFactor = 2000; // Base scale factor

      let scaledCoords = {
        x: Math.min(...points.map((p) => p.x)) / scaleFactor,
        y: Math.min(...points.map((p) => p.y)) / scaleFactor,
        maxX: Math.max(...points.map((p) => p.x)) / scaleFactor,
        maxY: Math.max(...points.map((p) => p.y)) / scaleFactor,
      };

      // Apply special scaling for large coordinates
      const maxX = Math.max(...points.map((p) => p.x));
      if (maxX > 2500) {
        scaledCoords.x *= 0.6;
        scaledCoords.maxX *= 0.6;
        scaledCoords.y *= 0.59;
        scaledCoords.maxY *= 0.59;
      }

      return {
        x: scaledCoords.x,
        y: scaledCoords.y,
        width: scaledCoords.maxX - scaledCoords.x,
        height: scaledCoords.maxY - scaledCoords.y,
      };
    }

    async loadAndParseXML(xmlFilePath) {
      try {
        // Check if the file path looks like an XML file
        if (!xmlFilePath.endsWith('.xml')) {
          console.log('🔍 File does not appear to be XML, skipping zone highlighting');
          return;
        }
        
        console.log('🔍 Loading XML file for zone highlighting:', xmlFilePath);
        const response = await fetch(xmlFilePath);
        
        if (!response.ok) {
          console.warn('⚠️ XML file not found or not accessible:', xmlFilePath);
          return;
        }
        
        const xmlString = await response.text();
        
        // Basic check to see if it's actually XML content
        if (!xmlString.trim().startsWith('<?xml') && !xmlString.trim().startsWith('<')) {
          console.warn('⚠️ File does not appear to contain XML content');
          return;
        }
        
        const zoneData = this.parseZonesFromXML(xmlString);
        this.addZoneOverlays(zoneData);
      } catch (err) {
        console.error("Error loading XML file:", err);
        // Don't let XML loading errors break the main functionality
        console.log('📄 Continuing without zone highlighting...');
      }
    }

    showHoverOverlay(pointsStr, imageWidth, imageHeight) {
      this.removeHoverOverlay();
      if (!pointsStr) return;

      const box = this.parsePolygonBoundingBox(pointsStr);
      if (!box) return;

      const normalizedBox = {
        x: box.left / imageWidth,
        y: box.top / imageHeight,
        width: box.width / imageWidth,
        height: box.height / imageHeight,
      };

      const overlay = document.createElement("div");
      overlay.id = "osd-hover-overlay";
      overlay.style.border = "2px solid orange";
      overlay.style.background = "rgba(255,165,0,0.15)";
      overlay.style.position = "absolute";

      this.viewer.addOverlay({
        element: overlay,
        location: new OpenSeadragon.Rect(
          normalizedBox.x,
          normalizedBox.y,
          normalizedBox.width,
          normalizedBox.height
        ),
      });
    }

    // Add a diagnostic method to check the current state of image loading
    checkCurrentImage() {
      console.log("🔍 Checking current image state:");
      console.log(`Current index: ${this.currentIndex}`);
      console.log(`Number of valid image tile sources: ${this.validImageTileSources?.length || 0}`);
      
      if (this.viewer.world.getItemCount() > 0) {
        const currentItem = this.viewer.world.getItemAt(0);
        console.log("Current OSD item:", currentItem);
        
        // Print more detailed source information
        if (currentItem.source) {
          if (typeof currentItem.source === 'string') {
            console.log("Current source (string):", currentItem.source);
          } else if (currentItem.source.url) {
            console.log("Current source URL:", currentItem.source.url);
          } else {
            console.log("Current source (object):", JSON.stringify(currentItem.source).substring(0, 200));
          }
        }
        
        // Check if we have the expected source for this index
        if (this.validImageTileSources && this.validImageTileSources.length > this.currentIndex) {
          const expectedSource = this.validImageTileSources[this.currentIndex];
          
          if (typeof expectedSource === 'string') {
            console.log("Expected source (string):", expectedSource);
          } else if (expectedSource.url) {
            console.log("Expected source URL:", expectedSource.url);
          } else {
            console.log("Expected source (object):", JSON.stringify(expectedSource).substring(0, 200));
          }
          
          // Compare sources in detail
          let sourcesMatch = false;
          
          if (typeof currentItem.source === 'string' && typeof expectedSource === 'string') {
            sourcesMatch = currentItem.source === expectedSource;
          } else if (currentItem.source.url && expectedSource.url) {
            sourcesMatch = currentItem.source.url === expectedSource.url;
          } else {
            // Compare JSON representations as fallback
            sourcesMatch = JSON.stringify(currentItem.source) === JSON.stringify(expectedSource);
          }
          
          if (!sourcesMatch) {
            console.warn("⚠️ Current image doesn't match expected image for this index!");
            
            // Print the unique reference ID of the sequence
            if (this.viewer.sequence) {
              console.log("Current sequence info:", {
                currentPage: this.viewer.currentPage(),
                sequenceLength: this.viewer.tileSources?.length || 0,
                sequenceMode: this.viewer.sequenceMode
              });
            }
          } else {
            console.log("✅ Current image matches expected image");
          }
        }
      } else {
        console.warn("No items in OSD world");
      }
      
      // Print the reference strip state - this is critical for debugging the thumbnails
      console.log("Reference strip state:");
      
      const referenceStrip = document.querySelector('.openseadragon-referencestrip');
      if (referenceStrip) {
        const thumbnails = referenceStrip.querySelectorAll('.referencestrip-scroll-bar > .referencestrip-preview');
        console.log(`Reference strip found with ${thumbnails.length} thumbnails`);
        
        // Check first 3 thumbnails
        for (let i = 0; i < Math.min(3, thumbnails.length); i++) {
          const thumbImg = thumbnails[i].querySelector('img');
          if (thumbImg) {
            console.log(`Thumbnail ${i} source: ${thumbImg.src.substring(0, 100)}...`);
          }
        }
      } else {
        console.log("No reference strip found");
      }
    }
    
    removeHoverOverlay() {
      const prev = document.getElementById("osd-hover-overlay");
      if (prev) this.viewer.removeOverlay(prev);
    }
    
    refreshOverlays() {
      console.log("🔄 Refreshing overlays for page:", this.currentIndex);
      
      // Get the current image dimensions
      if (this.viewer.world.getItemCount() > 0) {
        const currentImage = this.viewer.world.getItemAt(0);
        if (currentImage) {
          const imageSize = currentImage.getContentSize();
          const imageWidth = imageSize.x;
          const imageHeight = imageSize.y;
          
          // Clear existing overlays
          this.viewer.clearOverlays();
          
          // Re-add the surface overlay
          this.addSurfaceOverlay();
          
          // Re-add region overlays
          this.addImageRegionOverlays(imageWidth, imageHeight);
          
          // Re-setup hover overlays
          this.setupHoverOverlays(imageWidth, imageHeight);
          
          console.log("✅ Overlays refreshed with image dimensions:", imageWidth, "×", imageHeight);
        }
      }
    }

    // Page-based navigation methods
    initializePageView() {
      // Wrap all loose text nodes in spans to make them targetable
      const transcriptContainer = document.querySelector("#transcript");
      if (transcriptContainer) {
        this.wrapAllTextNodes(transcriptContainer);
      }
      // Don't show any page here - let the main init sequence handle it with the correct index
    }

    wrapAllTextNodes(element) {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
      const textNodes = [];
      let node;
      while(node = walker.nextNode()) {
        if (node.textContent.trim() !== '') {
          textNodes.push(node);
        }
      }
      
      textNodes.forEach(textNode => {
        const wrapper = document.createElement('span');
        textNode.parentNode.insertBefore(wrapper, textNode);
        wrapper.appendChild(textNode);
      });
    }

    showOnlyCurrentPage(currentPageIndex) {
      console.log(`📄 showOnlyCurrentPage called with index: ${currentPageIndex}`);
      const transcriptContainer = document.querySelector("#transcript");
      if (!transcriptContainer) {
        console.log('❌ No transcript container found');
        return;
      }

      const pbElements = document.getElementsByClassName("pb");
      const pbElementsArray = Array.from(pbElements);
      
      if (pbElementsArray.length === 0) {
        console.log('❌ No page break elements found');
        return;
      }

      console.log(`📄 Total pb elements: ${pbElementsArray.length}`);

      // Hide all horizontal rules to prevent visual artifacts
      transcriptContainer.querySelectorAll('hr').forEach(hr => hr.style.display = 'none');

      // Remove 'current' from all line break elements to reset the state
      transcriptContainer.querySelectorAll('br.lb').forEach(br => br.classList.remove('current'));

      const currentPbElement = pbElementsArray[currentPageIndex];
      const nextPbElement = pbElementsArray[currentPageIndex + 1];

      if (!currentPbElement) {
        console.log('❌ Current page element not found for index:', currentPageIndex);
        return;
      }

      console.log(`✅ Showing page ${currentPageIndex + 1}/${pbElementsArray.length}, current pb.id=${currentPbElement.id}, next pb:`, nextPbElement?.id || 'none');

      // 1. Get all elements within transcript container in document order
      const allElements = Array.from(transcriptContainer.querySelectorAll('*'));
      
      // 2. Find the start and end markers in the flat list
      const startIndex = allElements.indexOf(currentPbElement);
      
      if (startIndex === -1) {
        console.error('Could not find the current page break element in the DOM.');
        return;
      }
      
      let endIndex = allElements.length;
      if (nextPbElement) {
        const nextPbIndex = allElements.indexOf(nextPbElement);
        if (nextPbIndex > startIndex) {
          endIndex = nextPbIndex;
          console.log(`Page boundary: elements ${startIndex} to ${endIndex - 1} (next page starts at ${endIndex})`);
        }
      } else {
        console.log(`Last page: elements ${startIndex} to end (${allElements.length})`);
      }

      // 3. Collect all elements for the current page and their ancestors
      const elementsToShow = new Set();
      const elementsInRange = allElements.slice(startIndex, endIndex);

      console.log(`Elements in range for page ${currentPageIndex + 1}:`, elementsInRange.length);

      elementsInRange.forEach(element => {
        elementsToShow.add(element);
        // Add 'current' class to visible line breaks and mark split words
        if (element.tagName === 'BR' && element.classList.contains('lb')) {
          element.classList.add('current');
          const parent = element.parentElement;
          if (parent && parent.classList.contains('token')) {
            const prevSibling = element.previousElementSibling;
            if (prevSibling && prevSibling.tagName === 'SPAN') {
              prevSibling.classList.add('split-word-part-1');
            }
          }
        }
        let parent = element.parentElement;
        // Traverse up the DOM tree to ensure all parent containers are also shown
        while (parent && parent !== transcriptContainer) {
          elementsToShow.add(parent);
          parent = parent.parentElement;
        }
      });

      // 4. Apply visibility based on the collected set
      let hiddenCount = 0;
      let shownCount = 0;
      allElements.forEach(element => {
        if (elementsToShow.has(element)) {
          element.style.cssText = ''; // Reset to default display style
          element.classList.add('current-page');
          shownCount++;
        } else {
          element.style.cssText = 'display: none !important;';
          element.classList.remove('current-page');
          hiddenCount++;
        }
      });

      console.log(`Page ${currentPageIndex + 1}: ${shownCount} elements shown, ${hiddenCount} elements hidden`);
      console.log(`✅ showOnlyCurrentPage completed for index ${currentPageIndex}`);
    }
  }

  // Initialize the manuscript viewer
  new ManuscriptViewer();
});