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
      this.singleImageMode = false; // Flag to track if we're in single image mode (due to CORS)

      this.paragraphs = document.querySelectorAll("ab[data-target]");
      this.imageRegions = document.querySelectorAll(".image-region");

      this.init();
    }

    init() {
      this.setupViewer();
      this.iiifManifests = this.getIIIFManifests();

      if (this.iiifManifests.length > 0) {
        this.initializeFromHash();
        this.loadAllManifests(); // Load all manifests as a sequence
        this.setupNavigationButtons();
        this.setupPageNavigation();
        this.setupParagraphHighlighting();
        this.setupKeyboardNavigation(); // Add keyboard navigation

        // Trigger initial page display after a brief delay to ensure everything is loaded
        setTimeout(() => {
          this.showOnlyCurrentPage(this.currentIndex);
        }, 500);
      }
    }

    setupViewer() {
      this.viewer = OpenSeadragon({
        id: "container_facs_1",
        prefixUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/",
        visibilityRatio: 1,
        sequenceMode: true, // Enable sequence mode for proper navigation
        showNavigator: false,
        showSequenceControl: true, // Show sequence controls for navigation
        showNavigationControl: true,
        constrainDuringPan: true,
        tileSources: [],
      });

      this.viewer.addHandler("open", () => this.onImageOpen());
      
      // Add handler for page changes (when user clicks navigation buttons)
      this.viewer.addHandler("page", (event) => {
        console.log("📄 OpenSeadragon page event:", event.page);
        this.currentIndex = event.page;
        this.showOnlyCurrentPage(this.currentIndex);
      });
    }

    onImageOpen() {
      const imageSize = this.viewer.world.getItemAt(0).getContentSize();
      const imageWidth = imageSize.x;
      const imageHeight = imageSize.y;

      this.addSurfaceOverlay();
      this.addImageRegionOverlays(imageWidth, imageHeight);
      this.setupHoverOverlays(imageWidth, imageHeight);

      // Handle hash-based zone highlighting
      const hash = window.location.hash.substring(1);
      if (hash) {
        const xmlPath = window.location.pathname.replace(".html", ".xml");
        this.loadAndParseXML(xmlPath);
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
      console.log("🔄 Loading all manifests as sequence...");
      
      // Check if we're running locally and might have CORS issues
      const isLocalDev = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' || 
                        window.location.hostname === '0.0.0.0';
      
      if (isLocalDev) {
        console.log("🏠 Local development environment detected - using single image mode to avoid CORS issues");
        this.loadImageFromManifest(this.iiifManifests[this.currentIndex]);
        return;
      }
      
      // First, test connectivity to the IIIF service
      try {
        console.log("🔍 Testing connectivity to IIIF service...");
        const testResponse = await fetch('https://arche-iiifmanifest.acdh.oeaw.ac.at/', { 
          method: 'HEAD',
          mode: 'no-cors' 
        });
        console.log("✅ IIIF service is reachable");
      } catch (connectErr) {
        console.warn("⚠️ IIIF service connectivity test failed:", connectErr.message);
        console.log("This might be due to CORS restrictions, falling back to single image mode...");
        this.loadImageFromManifest(this.iiifManifests[this.currentIndex]);
        return;
      }
      
      const allImages = [];
      let successCount = 0;
      let errorCount = 0;
      
      // Load all manifests and collect their images with smaller image sizes for faster loading
      for (let i = 0; i < this.iiifManifests.length; i++) {
        const manifestUrl = this.iiifManifests[i];
        console.log(`Loading manifest ${i + 1}/${this.iiifManifests.length}`);
        console.log(`URL: ${manifestUrl}`);
        
        try {
          const response = await fetch(manifestUrl);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          const images = data.images || [];
          
          if (images.length > 0) {
            // Use smaller image size for faster loading
            const optimizedImage = typeof images[0] === "string" 
              ? images[0].replace(/\/full\/[^\/]+\/default\.(jpg|png)$/, "/full/!400,400/0/default.$1")
              : images[0];
            allImages.push(optimizedImage);
            successCount++;
            console.log(`✅ Manifest ${i + 1} loaded successfully`);
          } else {
            console.warn(`⚠️ No images found in manifest ${i + 1}: ${manifestUrl}`);
            // Add a placeholder to maintain index alignment
            allImages.push(null);
          }
        } catch (err) {
          console.error(`❌ Error loading manifest ${i + 1}:`, err.message);
          console.error(`❌ Full error:`, err);
          errorCount++;
          
          // If this is a NetworkError (CORS issue), switch to single image mode
          if (err.name === 'NetworkError' || err.message.includes('CORS') || err.message.includes('fetch')) {
            console.log("🔄 NetworkError detected - this is likely a CORS issue");
            console.log("🔄 Switching to single image mode for better compatibility...");
            this.loadImageFromManifest(this.iiifManifests[this.currentIndex]);
            return;
          }
          
          // Add a placeholder to maintain index alignment
          allImages.push(null);
        }
        
        // If we have too many consecutive failures at the start, break and use fallback
        if (i < 5 && errorCount > 3) {
          console.log("🔄 Too many early failures, switching to fallback mode...");
          this.loadImageFromManifest(this.iiifManifests[this.currentIndex]);
          return;
        }
      }
      
      // Filter out null placeholders for the final image array
      const validImages = allImages.filter(img => img !== null);
      
      console.log(`✅ Loaded ${successCount} valid images, ${errorCount} errors, ${validImages.length} total for sequence`);
      
      if (validImages.length > 0) {
        try {
          // Set up the viewer with valid images
          this.viewer.open(validImages);
          
          // Navigate to the correct page (adjusted for removed null entries)
          if (this.currentIndex > 0) {
            // Find the adjusted index by counting valid images up to currentIndex
            let adjustedIndex = 0;
            for (let i = 0; i < Math.min(this.currentIndex, allImages.length); i++) {
              if (allImages[i] !== null) {
                adjustedIndex++;
              }
            }
            if (adjustedIndex > 0) {
              this.viewer.goToPage(adjustedIndex - 1);
            }
          }
        } catch (viewerErr) {
          console.error("Error setting up viewer with images:", viewerErr);
          // Fallback to single manifest loading
          this.loadImageFromManifest(this.iiifManifests[this.currentIndex]);
        }
      } else {
        console.error("No valid images loaded, falling back to single image mode");
        // Fallback to single manifest loading
        this.loadImageFromManifest(this.iiifManifests[this.currentIndex]);
      }
    }

    async loadImageFromManifest(manifestUrl) {
      console.log(`🔍 Loading image for index ${this.currentIndex}, URL: ${manifestUrl}`);
      
      // Check if we're in local development and create a fallback
      const isLocalDev = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' || 
                        window.location.hostname === '0.0.0.0';
      
      if (isLocalDev) {
        console.log("🏠 Local development detected - creating placeholder image for navigation testing");
        this.createPlaceholderImage();
        return;
      }
      
      try {
        const response = await fetch(manifestUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const images = data.images || [];
        
        if (images.length === 0) {
          console.warn("No images found in manifest:", manifestUrl);
          this.createPlaceholderImage();
          return;
        }

        // Store image dimensions
        const image = images[0];
        if (typeof image === "object" && image.height && image.width) {
          this.currentImageDimensions = {
            width: image.width,
            height: image.height,
          };
        }

        // Optimize image URL
        const optimizedImage = typeof image === "string" 
          ? image.replace(/\/full\/[^\/]+\/default\.(jpg|png)$/, "/full/!600,600/0/default.$1")
          : image;

        console.log(`🎯 Final image URL to load:`, optimizedImage);

        // Load the single image (disable sequence mode for single image loading)
        this.viewer.sequenceMode = false;
        this.viewer.open(optimizedImage);
        this.singleImageMode = true; // Flag to indicate we're in single image mode
        this.refreshNavigationControls();
        
        console.log(`✅ Image loaded for page ${this.currentIndex + 1}`);
      } catch (err) {
        console.error("Error loading IIIF manifest:", err);
        // If even single image loading fails due to CORS, use placeholder
        if (err.name === 'NetworkError') {
          console.error("❌ CORS issue prevents loading any images");
          console.log("💡 Creating placeholder image for local development");
          this.createPlaceholderImage();
        }
      }
    }

    createPlaceholderImage() {
      console.log(`🎨 Creating placeholder image for page ${this.currentIndex + 1}`);
      
      // Create a simple colored square as a lightweight placeholder
      const size = 400;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      // Use different colors for different pages to make navigation more obvious
      const colors = ['#e8f4f8', '#f8e8e8', '#e8f8e8', '#f8f4e8', '#f4e8f8'];
      const bgColor = colors[this.currentIndex % colors.length];
      
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
      ctx.fillText(`${this.currentIndex + 1}`, size / 2, size / 2 - 20);
      
      // Draw label (smaller)
      ctx.font = '20px Arial';
      ctx.fillText('Facsimile Page', size / 2, size / 2 + 40);
      
      // Create a simple tile source object that OpenSeadragon can handle
      const tileSource = {
        type: 'image',
        url: canvas.toDataURL('image/png'),
        buildPyramid: false
      };
      
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
      // Try to find OpenSeadragon navigation buttons first
      let prev = document.querySelector("div[title='Previous page']");
      let next = document.querySelector("div[title='Next page']");
      
      // If not found, try custom buttons
      if (!prev || !next) {
        prev = this.customPrevBtn;
        next = this.customNextBtn;
      }

      if (prev && next) {
        const isFirstPage = this.currentIndex === 0;
        const isLastPage = this.currentIndex === this.iiifManifests.length - 1;

        prev.style.pointerEvents = isFirstPage ? "none" : "auto";
        prev.style.opacity = isFirstPage ? "0.5" : "1";

        next.style.pointerEvents = isLastPage ? "none" : "auto";
        next.style.opacity = isLastPage ? "0.5" : "1";
        
        console.log(`Navigation refreshed: currentIndex=${this.currentIndex}, total=${this.iiifManifests.length}, isFirst=${isFirstPage}, isLast=${isLastPage}`);
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
          
          // Always create placeholder image and update text for local development
          this.createPlaceholderImage();
          this.showOnlyCurrentPage(this.currentIndex);
          this.updateCustomButtonStates(prevBtn, nextBtn);
        }
      });

      nextBtn.addEventListener("click", () => {
        console.log("▶️ Custom NEXT button clicked - current index:", this.currentIndex);
        if (this.currentIndex < this.iiifManifests.length - 1) {
          this.currentIndex++;
          console.log("▶️ Moving to index:", this.currentIndex);
          
          // Always create placeholder image and update text for local development
          this.createPlaceholderImage();
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
              
              // Always create placeholder image and update text for local development
              this.createPlaceholderImage();
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
              
              // Always create placeholder image and update text for local development
              this.createPlaceholderImage();
              this.showOnlyCurrentPage(this.currentIndex);
            }
            break;
            
          case 'Home':
            event.preventDefault();
            this.currentIndex = 0;
            console.log("🏠 Keyboard navigation to HOME (index 0)");
            
            // Always create placeholder image and update text for local development
            this.createPlaceholderImage();
            this.showOnlyCurrentPage(this.currentIndex);
            break;
            
          case 'End':
            event.preventDefault();
            this.currentIndex = this.iiifManifests.length - 1;
            console.log("🔚 Keyboard navigation to END (index", this.currentIndex, ")");
            
            // Always create placeholder image and update text for local development
            this.createPlaceholderImage();
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

    removeHoverOverlay() {
      const prev = document.getElementById("osd-hover-overlay");
      if (prev) this.viewer.removeOverlay(prev);
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
