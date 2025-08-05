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
      this.overlaysInitialized = false; // Track if overlays have been set up
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
      
      // Listen for hash changes to help diagnose the highlighting issue
      window.addEventListener('hashchange', () => {
        console.log('🔄 Hash changed - this is a diagnostic message');
        const hash = window.location.hash.substring(1);
        console.log(`🔄 New hash: ${hash}`);
        if (hash) {
          console.log(`🔄 Will attempt to load XML for hash: ${hash}`);
          const xmlPath = window.location.pathname.replace(".html", ".xml");
          console.log(`🔄 XML path: ${xmlPath}`);
          setTimeout(() => {
            console.log(`🔄 Loading XML after delay...`);
            this.loadAndParseXML(xmlPath);
          }, 500);
        }
      });
    }

    init() {
      this.setupViewer();
      this.iiifManifests = this.getIIIFManifests();

      if (this.iiifManifests.length > 0) {
        // Determine which page to start on based on the hash
        if (window.location.hash) {
          console.log(`Processing initial hash: ${window.location.hash}`);
          this.initializeFromHash(window.location.hash.slice(1));
        } else {
          // CRITICAL FIX: With no hash, we want to always start at the very first page
          this.initializeFromHash();
          // Double check that we're really at index 0
          this.currentIndex = 0;
          console.log(`⚠️ No hash in URL, ensuring we start at index ${this.currentIndex}`);
        }
        
        console.log(`Starting with page index: ${this.currentIndex} based on hash`);
        
        
        // The viewer is now initialized with all tile sources.
        // We just need to ensure it navigates to the correct initial page.
        this.viewer.goToPage(this.currentIndex);
        
        this.setupNavigationButtons();
        this.setupPageNavigation();
        this.setupParagraphHighlighting();
        this.setupKeyboardNavigation(); // Add keyboard navigation

        // Trigger initial page display immediately with the correct index
        this.showOnlyCurrentPage(this.currentIndex);
        
        // Make sure we're actually on the right page and scroll to the element
        setTimeout(() => {
          // Force navigation to the correct page
          console.log(`Ensuring we're on page ${this.currentIndex}`);
          this.viewer.goToPage(this.currentIndex);
          
          // Reset view and refresh overlays
          this.viewer.viewport.goHome();
          this.refreshOverlays();
        }, 300);
      }
    }

    setupViewer() {
      // Determine which page to start on based on the hash before setting up the viewer
      if (window.location.hash) {
        console.log(`Processing initial hash: ${window.location.hash}`);
        this.initializeFromHash(window.location.hash.slice(1));
      } else {
        this.initializeFromHash();
        this.currentIndex = 0;
        console.log(`⚠️ No hash in URL, ensuring we start at index ${this.currentIndex}`);
      }

      this.iiifManifests = this.getIIIFManifests();

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
        tileSources: this.iiifManifests,
        initialPage: this.currentIndex,
      });

      // Log initial page setup
      console.log(`Setting up viewer with initial page: ${this.currentIndex}`);

      this.viewer.addHandler("open", () => {
        console.log(`🔥 Viewer open handler - current page should be ${this.currentIndex}`);
        this.onImageOpen();
      });
      
      // Add more diagnostic handlers to track image loading
      this.viewer.addHandler("tile-drawing", (event) => {
        console.log(`🎨 Tile drawing started for page ${this.currentIndex}`);
      });
      
      this.viewer.addHandler("tile-drawn", (event) => {
        console.log(`✅ Tile drawn for page ${this.currentIndex}`);
        // Trigger overlay setup once tiles are actually drawn
        if (!this.overlaysInitialized) {
          this.overlaysInitialized = true;
          console.log(`🔥 Tiles drawn - manually triggering onImageOpen`);
          this.onImageOpen();
        }
      });
      
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
        const previousIndex = this.currentIndex;
        
        // CRITICAL FIX: Make sure our tracking stays in sync with OSD
        this.currentIndex = event.page;
        
        console.log(`📄 Page event: ${previousIndex} → ${this.currentIndex} (event.page: ${event.page})`);
        
        // Always update text to match the current index
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
        
        // Add a style for highlighted elements if not already present
        if (!document.getElementById('highlight-style')) {
          const style = document.createElement('style');
          style.id = 'highlight-style';
          style.textContent = `
            .highlight-element {
              background-color: yellow !important;
              outline: 2px solid orange !important;
              transition: background-color 0.5s, outline 0.5s;
            }
          `;
          document.head.appendChild(style);
        }
        
        // Handle hash-based text highlighting without zooming
        // Note: We don't process hashToProcess here anymore since it's handled in loadImageFromManifest
        const hash = window.location.hash.substring(1);
        if (hash) {
          console.log(`🔍 onImageOpen: Processing hash: ${hash}`);
          const xmlPath = window.location.pathname.replace(".html", ".xml");
          console.log(`🔍 onImageOpen: XML path: ${xmlPath}`);
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
        .querySelectorAll(".notation[data-points]:not(ab .notation)")
        .forEach((el) => {
          el.addEventListener("mouseenter", () => {
            const pointsStr = el.getAttribute("data-points");
            if (!pointsStr) return;
            const box = this.parsePolygonBoundingBox(pointsStr);
            if (!box) return;
            
            // Try different Y-coordinate correction strategies
            // Strategy 1: Use the bottom of the bounding box instead of top
            const useBottomStrategy = false; // Set to true to test
            
            // Strategy 2: Subtract from Y instead of adding (maybe coordinates are inverted)
            const useSubtractStrategy = false; // Set to true to test
            
            // Strategy 3: Use a fixed pixel offset instead of percentage
            const useFixedOffset = false; // Set to true to test
            
            // Strategy 5: Proper coordinate correction like X-axis
            const useProperCorrection = true;
            
            let adjustedBox;
            if (useProperCorrection) {
              // Get the current image bounds to understand the actual coordinate system
              const currentItem = this.viewer.world.getItemAt(0);
              const imageBounds = currentItem ? currentItem.getBounds() : null;
              
              // Apply proper coordinate correction based on actual image positioning
              // This accounts for how OpenSeadragon actually positions the image
              let correctedLeft = box.left;
              let correctedTop = box.top;
              
              // If we have image bounds, use them for more accurate positioning
              if (imageBounds) {
                // Convert image pixel coordinates to normalized coordinates
                correctedLeft = box.left / imageWidth;
                correctedTop = box.top / imageHeight;
                
                // Apply the image bounds transformation
                correctedLeft = imageBounds.x + (correctedLeft * imageBounds.width);
                correctedTop = imageBounds.y + (correctedTop * imageBounds.height);
                
                // Convert back to pixel coordinates for the overlay
                correctedLeft = correctedLeft * imageWidth;
                correctedTop = correctedTop * imageHeight;
              }
              
              adjustedBox = {
                left: correctedLeft,
                top: correctedTop,
                width: box.width,
                height: box.height
              };
            } else {
              // Fallback to original strategy
              const lineHeightOffset = Math.round(box.height * 0.15);
              adjustedBox = {
                left: box.left,
                top: box.top + lineHeightOffset,
                width: box.width,
                height: box.height
              };
            }
            
            const normalizedBox = {
              x: adjustedBox.left / imageWidth,
              y: adjustedBox.top / imageHeight,
              width: adjustedBox.width / imageWidth,
              height: adjustedBox.height / imageHeight,
            };
            const overlay = document.createElement("div");
            overlay.id = "osd-hover-overlay";
            overlay.style.border = "3px solid #0f0";
            overlay.style.background = "transparent";
            overlay.style.position = "absolute";
            overlay.style.zIndex = "100000";
            overlay.style.pointerEvents = "none";
            
            this.viewer.addOverlay({
              element: overlay,
              location: new OpenSeadragon.Rect(
                normalizedBox.x,
                normalizedBox.y,
                normalizedBox.width,
                normalizedBox.height
              )
            });
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
      const tileSources = [];
      Array.from(pbElements).forEach((el, index) => {
        const imgSource = el.getAttribute("source");
        if (imgSource) {
          // Clean the imgSource - remove duplicate URLs and trim whitespace
          const cleanedSource = imgSource.trim().split(/\s+/)[0]; // Take only the first URL if there are multiple
          // Validate that it looks like a proper URL
          let infoJsonUrl = '';
          if (cleanedSource.startsWith('https://hdl.handle.net/')) {
            // For handle.net PIDs, use @format=image%2Fjson
            infoJsonUrl = `${cleanedSource}@format=image%2Fjson`;
          } else if (cleanedSource.startsWith('https://id.acdh.oeaw.ac.at/')) {
            // For id.acdh.oeaw.ac.at, use ?format=image%2Fjson
            infoJsonUrl = `${cleanedSource}?format=image%2Fjson`;
          } else {
            // Fallback: try ?format=image%2Fjson
            infoJsonUrl = `${cleanedSource}?format=image%2Fjson`;
          }
          tileSources.push(infoJsonUrl);
          if (index === 0) {
            console.log(`FIRST pb element: pb.id=${el.id}, source=${cleanedSource}`);
            console.log(`FIRST info.json URL: ${infoJsonUrl}`);
          }
        } else {
          console.warn("No 'source' attribute found for element:", el);
        }
      });
      console.log(`Total tile sources: ${tileSources.length}, Total pb elements: ${pbElements.length}`);
      // Log first few manifest URLs for debugging
      console.log("First 3 tile sources:");
      tileSources.slice(0, 3).forEach((url, index) => {
        console.log(`  ${index + 1}: ${url}`);
      });
      // Diagnostic: log all pb ids and manifest URLs for first 5 pages
      for (let i = 0; i < Math.min(5, pbElements.length); i++) {
        console.log(`pb[${i}] id: ${pbElements[i].id}, tileSource: ${tileSources[i]}`);
      }
      return tileSources;
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

      // Save the target index before opening
      const targetIndex = this.currentIndex;

      // Open with the array of processed image URLs and go directly to the target page
      this.viewer.openWithOptions({
        tileSources: processedImages,
        initialPage: Math.max(0, targetIndex)
      });

      // Call diagnostic function to verify image sequence
      setTimeout(() => this.checkCurrentImage(), 100);

      // Always force navigation to the correct page, even for page 0
      setTimeout(() => {
        const tryForcePage = (attempt = 0) => {
          const currentOsdPage = this.viewer.currentPage();
          if (currentOsdPage !== targetIndex) {
            this.viewer.goToPage(targetIndex);
            // Double-check after a short delay, up to 3 attempts
            if (attempt < 2) {
              setTimeout(() => tryForcePage(attempt + 1), 60);
            } else {
              // As a last resort, use currentPage setter if available
              if (this.viewer.currentPage && typeof this.viewer.currentPage === 'function') {
                try {
                  this.viewer.currentPage(targetIndex);
                } catch (e) {
                  // ...existing code...
                }
              }
              // Always sync transcript to actual OSD page
              const finalPage = this.viewer.currentPage();
              console.log(`[SYNC] Final OSD page: ${finalPage}, targetIndex: ${targetIndex}`);
              this.showOnlyCurrentPage(finalPage);
            }
          } else {
            // Always sync transcript to actual OSD page
            console.log(`[SYNC] OSD page already correct: ${currentOsdPage}, targetIndex: ${targetIndex}`);
            this.showOnlyCurrentPage(currentOsdPage);
          }
        };
        tryForcePage(0);

        // Handle any stored hash after navigation
        if (this.hashToProcess) {
          const targetElement = document.getElementById(this.hashToProcess);
          if (targetElement) {
            setTimeout(() => {
              targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              targetElement.classList.add('highlight-element');
              setTimeout(() => targetElement.classList.remove('highlight-element'), 3000);
            }, 300);
          }
          this.hashToProcess = null;
        }
      }, 200);
    }

    async loadImageFromManifest(manifestUrl) {
      console.log(`🔍 Loading image for index ${this.currentIndex}, URL: ${manifestUrl}`);
      
      try {
        const response = await fetch(manifestUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // The response should be the info.json content directly
        this.viewer.open(data);
        
        console.log(`✅ Image loaded successfully for index ${this.currentIndex}`);
      } catch (err) {
        console.error("Error loading IIIF info.json:", err);
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
        // Always start at index 0 (first page) if no hash
        this.currentIndex = 0;
        this.hashToProcess = null;
        return;
      }

      console.log(`Processing hash: ${hash}`);
      // For hashes like facs_4_rRTYy_25_line_006, extract the page number
      const pageParts = hash.match(/facs_(\d+)/);
      if (pageParts && pageParts[1]) {
        const pageNum = parseInt(pageParts[1], 10);
        if (!isNaN(pageNum) && pageNum > 0) {
          // Always use pageNum - 1 for zero-based index
          this.currentIndex = pageNum - 1;
          // Clamp to valid range
          if (this.currentIndex < 0) this.currentIndex = 0;
          if (this.currentIndex >= this.iiifManifests.length) this.currentIndex = this.iiifManifests.length - 1;
          console.log(`⚠️ FIXED INDEXING: Determined page index ${this.currentIndex} from hash number ${pageNum}`);
          this.hashToProcess = hash;
          return;
        }
      }

      // If direct extraction didn't work, fall back to the element ID method
      const baseId = hash.split("_").slice(0, 2).join("_");
      console.log(`Base ID extracted from hash: ${baseId}`);
      const targetElement = document.getElementById(hash);

      if (targetElement) {
        // Find correct page index by matching pb element id
        const pbElements = document.getElementsByClassName("pb");
        let foundIndex = -1;
        Array.from(pbElements).forEach((element, index) => {
          if (element.id === baseId) {
            foundIndex = index;
          }
        });
        this.currentIndex = foundIndex >= 0 ? foundIndex : 0;
        // Clamp to valid range
        if (this.currentIndex < 0) this.currentIndex = 0;
        if (this.currentIndex >= this.iiifManifests.length) this.currentIndex = this.iiifManifests.length - 1;
        this.hashToProcess = hash;
      } else {
        // If hash exists but element not found, start at index 0
        this.currentIndex = 0;
        this.hashToProcess = null;
      }
    }

    parseZonesFromXML(xmlString) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");
      const hash = window.location.hash.substring(1);
      if (!hash) return [];
      console.log(`📌 Parsing XML for hash: ${hash}`);
      const baseId = hash.split("_").slice(0, 2).join("_");
      console.log(`📌 Base ID: ${baseId}`);
      const surfaces = xmlDoc.getElementsByTagNameNS("*", "surface");
      console.log(`📌 Found ${surfaces.length} surfaces in XML`);
      let targetSurface = null;
      for (let surface of surfaces) {
        const surfaceId = surface.getAttributeNS("http://www.w3.org/XML/1998/namespace", "id");
        console.log(`📌 Checking surface: ${surfaceId} vs ${baseId}`);
        if (surfaceId === baseId) {
          targetSurface = surface;
          console.log(`📌 Found matching surface: ${surfaceId}`);
          break;
        }
      }
      if (!targetSurface) {
        console.log(`❌ No matching surface found for baseId: ${baseId}`);
        return [];
      }
      // Try to get region bounding box from surface attributes (ulx, uly, lrx, lry, or similar)
      let regionBox = null;
      const ulx = parseInt(targetSurface.getAttribute("ulx"), 10);
      const uly = parseInt(targetSurface.getAttribute("uly"), 10);
      const lrx = parseInt(targetSurface.getAttribute("lrx"), 10);
      const lry = parseInt(targetSurface.getAttribute("lry"), 10);
      if (!isNaN(ulx) && !isNaN(uly) && !isNaN(lrx) && !isNaN(lry)) {
        regionBox = {
          left: ulx,
          top: uly,
          width: lrx - ulx,
          height: lry - uly
        };
        console.log(`📌 Found regionBox from surface:`, regionBox);
      }
      console.log(`📌 Looking for zones in surface: ${baseId}`);
      const zones = targetSurface.getElementsByTagNameNS("*", "zone");
      console.log(`📌 Found ${zones.length} zones in surface`);
      let targetZone = null;
      // Find zone by hash ID
      for (let zone of zones) {
        const zoneId = zone.getAttributeNS("http://www.w3.org/XML/1998/namespace", "id");
        console.log(`📌 Checking zone: ${zoneId} vs ${hash}`);
        if (zoneId === hash) {
          targetZone = zone;
          console.log(`📌 Found matching zone by direct ID: ${zoneId}`);
          break;
        }
      }
      // Fallback: find zone referenced by lb element
      if (!targetZone) {
        console.log(`📌 Trying fallback: looking for lb element with facs='#${hash}'`);
        const lbElement = xmlDoc.querySelector(`lb[facs='#${hash}']`);
        if (lbElement) {
          console.log(`📌 Found lb element with facs='#${hash}'`);
          const referencedZoneId = lbElement.getAttribute("facs").substring(1);
          console.log(`📌 Referenced zone ID: ${referencedZoneId}`);
          for (let zone of zones) {
            const zoneId = zone.getAttributeNS("http://www.w3.org/XML/1998/namespace", "id");
            console.log(`📌 Checking zone: ${zoneId} vs ${referencedZoneId}`);
            if (zoneId === referencedZoneId) {
              targetZone = zone;
              console.log(`📌 Found matching zone by reference: ${zoneId}`);
              break;
            }
          }
        } else {
          console.log(`❌ No lb element found with facs='#${hash}'`);
        }
      }
      if (!targetZone) {
        console.log(`❌ No matching zone found for ID: ${hash}`);
        return [];
      }
      console.log(`📌 Getting points from zone`);
      const pointsStr = targetZone.getAttribute("points");
      console.log(`📌 Raw points string: ${pointsStr}`);
      if (!pointsStr) {
        console.log(`❌ No points attribute found in zone`);
        return [];
      }
      const points = pointsStr
        .split(" ")
        .map((point) => {
          const [x, y] = point.split(",");
          return { x: parseInt(x, 10), y: parseInt(y, 10) };
        });
      console.log(`📌 Parsed ${points.length} points:`, points);
      // Pass regionBox along with points for normalization
      return [{ id: hash, points, regionBox }];
    }

    addZoneOverlays(zoneData) {
      console.log(`🔍 Adding zone overlays for ${zoneData.length} zones`);
      if (!zoneData.length) return;
      this.viewer.clearOverlays();
      this.addSurfaceOverlay();
      zoneData.forEach((zone) => {
        console.log(`🔍 Processing zone: ${zone.id}`);
        const points = zone.points;
        const regionBox = zone.regionBox || null;
        console.log(`🔍 Zone points:`, points);
        const scaledCoords = this.calculateScaledCoordinates(points, regionBox);
        console.log(`🔍 Scaled coordinates:`, scaledCoords);
        const overlay = document.createElement("div");
        overlay.style.border = "2px solid rgba(0,255,0,0.5)";
        overlay.style.background = "rgba(0,255,0,0.2)";
        overlay.style.pointerEvents = "none";
        overlay.style.position = "absolute";
        console.log(`🔍 Adding overlay at:`, scaledCoords);
        this.viewer.addOverlay({
          element: overlay,
          location: new OpenSeadragon.Rect(
            scaledCoords.x,
            scaledCoords.y,
            scaledCoords.width,
            scaledCoords.height
          ),
        });
        console.log(`✅ Overlay added for zone: ${zone.id}`);
      });
    }

    calculateScaledCoordinates(points, regionBox = null) {
      // Use regionBox for normalization if provided, otherwise use full image dimensions
      let imageWidth = 2000;
      let imageHeight = 2000;
      let offsetX = 0;
      let offsetY = 0;
      if (regionBox && regionBox.width && regionBox.height) {
        imageWidth = regionBox.width;
        imageHeight = regionBox.height;
        offsetX = regionBox.left || 0;
        offsetY = regionBox.top || 0;
      } else if (this.currentImageDimensions && this.currentImageDimensions.x && this.currentImageDimensions.y) {
        imageWidth = this.currentImageDimensions.x;
        imageHeight = this.currentImageDimensions.y;
      } else if (this.viewer && this.viewer.world && this.viewer.world.getItemCount() > 0) {
        const currentItem = this.viewer.world.getItemAt(0);
        if (currentItem && typeof currentItem.getContentSize === 'function') {
          const size = currentItem.getContentSize();
          imageWidth = size.x;
          imageHeight = size.y;
        }
      }
      // Calculate bounding box from points
      const xs = points.map((p) => p.x);
      const ys = points.map((p) => p.y);
      const left = Math.min(...xs) - offsetX;
      const top = Math.min(...ys) - offsetY;
      const width = Math.max(...xs) - Math.min(...xs);
      const height = Math.max(...ys) - Math.min(...ys);
      const result = {
        x: left / imageWidth,
        y: top / imageHeight,
        width: width / imageWidth,
        height: height / imageHeight,
      };
      console.log(`📊 Final result:`, result);
      return result;
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
        
        console.log(`📄 XML file loaded, length: ${xmlString.length} chars`);
        const zoneData = this.parseZonesFromXML(xmlString);
        console.log(`📄 Zone data parsed:`, zoneData);
        
        if (zoneData.length > 0) {
          console.log(`📄 Adding overlays for ${zoneData.length} zones`);
          this.addZoneOverlays(zoneData);
        } else {
          console.log(`📄 No zones found in XML for current hash`);
        }
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
      console.log(`Current index tracking: ${this.currentIndex}`);
      console.log(`Current OSD page(): ${this.viewer.currentPage()}`);
      console.log(`Number of valid image tile sources: ${this.validImageTileSources?.length || 0}`);
      
      // CRITICAL FIX: There's a mismatch between OSD's page numbering and our index tracking
      // Always force page synchronization to match our expected index
      if (this.viewer.currentPage() !== this.currentIndex) {
        console.warn(`⚠️ Index mismatch detected! Our index: ${this.currentIndex}, OSD page: ${this.viewer.currentPage()}`);
        
        // Force navigation to our expected page
        console.log(`🔄 Forcing OSD page to match our index (${this.currentIndex})`);
        this.viewer.goToPage(this.currentIndex);
        
        // Double-check after a short delay to ensure page change took effect
        setTimeout(() => {
          if (this.viewer.currentPage() !== this.currentIndex) {
            console.warn(`⚠️ Page alignment failed! Using direct method`);
            // You may want to add code here to force page alignment if needed
          }
        }, 50);
      } else {
        console.log("✅ Current image matches expected image");
      }
    }
    // ...existing code...
    
    removeHoverOverlay() {
      const prev = document.getElementById("osd-hover-overlay");
      if (prev) this.viewer.removeOverlay(prev);
    }
    
    showCoordinateOverlay(x, y) {
      // Remove any existing coordinate overlay
      const existing = document.getElementById("coordinate-click-overlay");
      if (existing) this.viewer.removeOverlay(existing);
      
      // Create new coordinate overlay
      const overlay = document.createElement("div");
      overlay.id = "coordinate-click-overlay";
      overlay.style.position = "absolute";
      overlay.style.pointerEvents = "none";
      overlay.style.zIndex = "100000";
      overlay.style.background = "rgba(255, 0, 0, 0.8)";
      overlay.style.color = "white";
      overlay.style.padding = "4px 8px";
      overlay.style.borderRadius = "4px";
      overlay.style.fontSize = "12px";
      overlay.style.fontWeight = "bold";
      overlay.innerHTML = `(${Math.round(x)}, ${Math.round(y)})`;
      
      // Convert image coordinates to normalized coordinates for overlay
      if (this.viewer.world.getItemCount() > 0) {
        const currentImage = this.viewer.world.getItemAt(0);
        const imageSize = currentImage.getContentSize();
        const normalizedX = x / imageSize.x;
        const normalizedY = y / imageSize.y;
        
        // Place overlay at clicked position (as a point)
        this.viewer.addOverlay({
          element: overlay,
          location: new OpenSeadragon.Point(normalizedX, normalizedY)
        });
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
          const overlayToRemove = document.getElementById("coordinate-click-overlay");
          if (overlayToRemove) this.viewer.removeOverlay(overlayToRemove);
        }, 3000);
      }
    }
    
    updateMouseCoordinateDisplay(x, y) {
      // Create or update a persistent coordinate display
      let display = document.getElementById("mouse-coordinate-display");
      if (!display) {
        display = document.createElement("div");
        display.id = "mouse-coordinate-display";
        display.style.position = "fixed";
        display.style.top = "10px";
        display.style.right = "10px";
        display.style.background = "rgba(0, 0, 0, 0.8)";
        display.style.color = "white";
        display.style.padding = "4px 8px";
        display.style.borderRadius = "4px";
        display.style.fontSize = "12px";
        display.style.fontWeight = "bold";
        display.style.zIndex = "100001";
        display.style.pointerEvents = "none";
        document.body.appendChild(display);
      }
      display.innerHTML = `Mouse: (${Math.round(x)}, ${Math.round(y)})`;
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
          
          // Check if we need to process a hash for highlighting
          const hash = window.location.hash.substring(1);
          if (hash) {
            console.log(`🔄 refreshOverlays: Processing hash: ${hash}`);
            const xmlPath = window.location.pathname.replace(".html", ".xml");
            console.log(`🔄 refreshOverlays: XML path: ${xmlPath}`);
            this.loadAndParseXML(xmlPath);
          }
          
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
      // Clamp index to valid range
      const pbElements = document.getElementsByClassName("pb");
      const pbElementsArray = Array.from(pbElements);
      const maxIndex = pbElementsArray.length - 1;
      let idx = currentPageIndex;
      if (idx < 0) idx = 0;
      if (idx > maxIndex) idx = maxIndex;
      console.log(`📄 showOnlyCurrentPage called with index: ${idx}`);
      // After showing transcript, force OSD viewer to correct page
      if (this.viewer && typeof this.viewer.goToPage === 'function') {
        if (this.viewer.currentPage() !== idx) {
          console.warn(`Forcing OSD viewer to page ${idx} (was ${this.viewer.currentPage()})`);
          this.viewer.goToPage(idx);
        } else {
          console.log(`OSD viewer already at correct page ${idx}`);
        }
        // Diagnostic: log pb id and manifest URL for this page
        const manifestUrl = this.iiifManifests && this.iiifManifests[idx] ? this.iiifManifests[idx] : '(none)';
        console.log(`Transcript pb id for page ${idx}:`, pbElementsArray[idx]?.id || '(none)');
        console.log(`Manifest URL for page ${idx}:`, manifestUrl);
      }
      const transcriptContainer = document.querySelector("#transcript");
      if (!transcriptContainer) {
        console.log('❌ No transcript container found');
        return;
      }
      if (pbElementsArray.length === 0) {
        console.log('❌ No page break elements found');
        return;
      }
      console.log(`📄 Total pb elements: ${pbElementsArray.length}`);
      // Hide all horizontal rules to prevent visual artifacts
      transcriptContainer.querySelectorAll('hr').forEach(hr => hr.style.display = 'none');
      // Remove 'current' from all line break elements to reset the state
      transcriptContainer.querySelectorAll('br.lb').forEach(br => br.classList.remove('current'));
      const currentPbElement = pbElementsArray[idx];
      const nextPbElement = pbElementsArray[idx + 1];
      if (!currentPbElement) {
        console.log('❌ Current page element not found for index:', idx);
        return;
      }
      console.log(`✅ Showing page ${idx + 1}/${pbElementsArray.length}, current pb.id=${currentPbElement.id}, next pb:`, nextPbElement?.id || 'none');
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