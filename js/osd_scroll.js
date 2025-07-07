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

      this.paragraphs = document.querySelectorAll("ab[data-target]");
      this.imageRegions = document.querySelectorAll(".image-region");

      this.init();
    }

    init() {
      this.setupViewer();
      this.iiifManifests = this.getIIIFManifests();

      if (this.iiifManifests.length > 0) {
        this.initializeFromHash();
        this.loadImageFromManifest(this.iiifManifests[this.currentIndex]);
        this.setupNavigationButtons();
        this.setupScrollNavigation();
        this.setupParagraphHighlighting();

        // Trigger initial scroll event after a brief delay to ensure everything is loaded
        setTimeout(() => {
          document
            .querySelector("#transcript")
            ?.dispatchEvent(new Event("scroll"));
        }, 300);
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
          const manifestUrl = `https://arche-iiifmanifest.acdh.oeaw.ac.at/?id=${encodeURIComponent(
            imgSource
          )}&mode=images`;
          manifests.push(manifestUrl);
        } else {
          console.warn("No 'source' attribute found for element:", el);
        }
      });
      return manifests;
    }

    async loadImageFromManifest(manifestUrl) {
        console.log("🔍 LOADING IMAGE DEBUG");
  console.log("currentIndex:", this.currentIndex);
  console.log("manifestUrl being loaded:", manifestUrl);
  console.log("Expected facs_1 URL:", this.iiifManifests[0]);
  console.log("Are they the same?", manifestUrl === this.iiifManifests[0]);
      try {
        
        const response = await fetch(manifestUrl);
        const data = await response.json();
            console.log("Manifest data received:", data);
        const images = data.images || [];
        console.log("Images found:", images.length);
    console.log("First image URL:", images[0]);
        if (images.length === 0) {
          console.warn("No images found in manifest:", manifestUrl);
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

        // Optimize image URLs
        const optimizedImages = images.map((img) => {
          if (typeof img === "string") {
            return img.replace(
              /\/full\/[^\/]+\/default\.(jpg|png)$/,
              "/full/!600,600/0/default.$1"
            );
          }
          return img;
        });

        this.viewer.tileSources = optimizedImages;
        this.viewer.clearOverlays();
        this.viewer.open(optimizedImages[this.currentIndex]);

        this.refreshNavigationControls();
      } catch (err) {
        console.error("Error loading IIIF manifest:", err);
      }
    }

    refreshNavigationControls() {
      const prev = document.querySelector("div[title='Previous page']");
      const next = document.querySelector("div[title='Next page']");

      if (prev && next) {
        const isFirstPage = this.currentIndex === 0;
        const isLastPage =
          this.currentIndex === this.viewer.tileSources.length - 1;

        prev.style.pointerEvents = isFirstPage ? "none" : "auto";
        prev.style.opacity = isFirstPage ? "0.5" : "1";

        next.style.pointerEvents = isLastPage ? "none" : "auto";
        next.style.opacity = isLastPage ? "0.5" : "1";
      }
    }

    setupScrollNavigation() {
      const pbElements = document.getElementsByClassName("pb");
      const scrollContainer = document.querySelector("#transcript");

      if (!scrollContainer) return;

      // Add throttling to prevent too many scroll events
      let scrollTimeout;

      scrollContainer.addEventListener("scroll", () => {
        if (this.isManualNavigation) return;

        // Clear the previous timeout
        clearTimeout(scrollTimeout);

        // Set a new timeout to delay the execution
        scrollTimeout = setTimeout(() => {
          let mostVisibleIndex = 0;
          let maxVisibility = 0;
          const containerRect = scrollContainer.getBoundingClientRect();

          // Find the most visible pb element
          Array.from(pbElements).forEach((element, index) => {
            const rect = element.getBoundingClientRect();

            // Calculate how much of the element is visible
            const visibleTop = Math.max(rect.top, containerRect.top);
            const visibleBottom = Math.min(rect.bottom, containerRect.bottom);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);

            // Calculate visibility as a percentage of the element's height
            const visibility = visibleHeight / rect.height;

            // If this element is more visible than the current most visible
            if (visibility > maxVisibility) {
              maxVisibility = visibility;
              mostVisibleIndex = index;
            }
          });

          // Only update if index changed AND we have significant visibility
          if (mostVisibleIndex !== this.currentIndex && maxVisibility > 0.3) {
            console.log(
              `Switching from page ${this.currentIndex} to page ${mostVisibleIndex}`
            );
            this.currentIndex = mostVisibleIndex;
            this.loadImageFromManifest(this.iiifManifests[this.currentIndex]);
          }
        }, 150); // 150ms delay to throttle scroll events
      });
    }
    setupNavigationButtons() {
      const prev = document.querySelector("div[title='Previous page']");
      const next = document.querySelector("div[title='Next page']");

      if (!prev || !next) {
        console.error("Navigation buttons not found.");
        return;
      }

      prev.addEventListener("click", () => {
        if (this.currentIndex > 0) {
          this.currentIndex--;
          this.loadImageFromManifest(this.iiifManifests[this.currentIndex]);
        }
      });

      next.addEventListener("click", () => {
        if (this.currentIndex < this.iiifManifests.length - 1) {
          this.currentIndex++;
          this.loadImageFromManifest(this.iiifManifests[this.currentIndex]);
        }
      });
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
        const response = await fetch(xmlFilePath);
        const xmlString = await response.text();
        const zoneData = this.parseZonesFromXML(xmlString);
        this.addZoneOverlays(zoneData);
      } catch (err) {
        console.error("Error loading XML file:", err);
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
  }

  // Initialize the manuscript viewer
  new ManuscriptViewer();
});
