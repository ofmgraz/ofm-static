const container_facs_1 = document.getElementById("container_facs_1");
const text_wrapper = document.getElementsByClassName("facsimiles")[0];
container_facs_1.style.height = `${String(screen.height / 2)}px`;
const transcript =  document.getElementById("text-resize");
/*
##################################################################
get all image urls stored in span el class tei-xml-images
creates an array for osd viewer with static images
##################################################################
*/
const navbar_wrapper = document.getElementById("wrapper-navbar");
const image_rights = document.getElementsByClassName("image_rights")[0];

function calculate_facsContainer_height() {
  // calcutlates hight of osd container based on heigt of screen - (height of navbar + img rights&buttons)
 
  let new_container_height =
    window.innerHeight -
    (window.innerHeight / 10);
  return Math.round(new_container_height);
};

// initially resizing the facs container to max
// needs to be done before calling the viewer construtor, 
// since it doesnt update size
resize_facsContainer();

/*
##################################################################
get all image urls stored in span el class tei-xml-images
creates an array for osd viewer with static images
##################################################################
*/
var pb_elements = document.getElementsByClassName("pb");
var pb_elements_array = Array.from(pb_elements);
var tileSources = [];
var img = pb_elements[0].getAttribute("source");
var imageURL = {
  type: "image",
  url: img,
};
tileSources.push(imageURL);

/*
##################################################################
initialize osd
##################################################################
*/
var viewer = new OpenSeadragon.Viewer({
	id: 'container_facs_1',
	prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/',
	visibilityRatio: 1,
	sequenceMode: true,
	showNavigator: false,
	showNavigationControl: true,
	showSequenceControl: true,
	showZoomControl: true,
	constrainDuringPan: true,
  visibilityRatio: 1,
	/* zoomInButton: "osd_zoom_in_button",
	zoomOutButton: "osd_zoom_out_button",
	homeButton : "osd_zoom_reset_button", */
	constrainDuringPan: true,
    tileSources: tileSources
});

/*
##################################################################
index and previous index for click navigation in osd viewer
locate index of anchor element
##################################################################
*/
var idx = 0;
var prev_idx = -1;

/* change size of facs container */
function resize_facsContainer() {
  let new_container_height = calculate_facsContainer_height();
  if (new_container_height != container_facs_1.clientHeight) {
    container_facs_1.style.height = `${String(new_container_height)}px`;
    return true;
  };
  return false;
};

function check_bottom_whitespace_of_textWrapper(check_bottom_whitespace) {
  if (check_bottom_whitespace === undefined) {
    check_bottom_whitespace = false;
  }
  if (check_bottom_whitespace === true){
    if (bottom_whitespace == 0) {
      change_bottom_whitespace_of_textWrapper();
    }
  } else {
      change_bottom_whitespace_of_textWrapper();
  }
}

/*.edition_container div {
	background-color: inherit;
} */

function change_bottom_whitespace_of_textWrapper() {
  bottom_whitespace = ((window.innerHeight / 10) *8);
  text_wrapper.style.paddingBottom = `${bottom_whitespace}px`
};


/*
##################################################################
triggers on scroll and switches osd viewer image base on 
viewport position of next and previous element with class pb
pb = pagebreaks
##################################################################
*/

transcript.addEventListener("scroll", function(event) {
  // elements in view
  var esiv = [];
  console.log('a') ;
  for (let el of pb_elements) {
    console.log(el) ;
      if (isInViewportAll(el)) {
          esiv.push(el);
          console.log(el)
      }
  }
  if (esiv.length != 0) {
      // first element in view
      var eiv = esiv[0];
      // get idx of element
      var eiv_idx = Array.from(pb_elements).findIndex((el) => el === eiv);
      idx = eiv_idx + 1;
      prev_idx = eiv_idx - 1
      // test if element is in viewport position to load correct image
      if (isInViewport(pb_elements[eiv_idx])) {
          loadNewImage(pb_elements[eiv_idx]);
      }
  }
});





addEventListener("resize", function (event) {
    let resized = resize_facsContainer();
    if (resized) {
        viewer.forceResize();
        fitVertically_align_left_bottom(viewer);
    };
    check_bottom_whitespace_of_textWrapper();
  }
);

/*
##################################################################
get container holding images urls as child elements
get container for osd viewer
get container wrapper of osd viewer
##################################################################
*/
// var container = document.getElementById("container_facs_2");
// container.style.display = "none";
var height = screen.height;
var container = document.getElementById("container_facs_1");
var wrapper = document.getElementsByClassName("facsimiles")[0];
var pb_elements = document.getElementsByClassName("pb");      
var pb_elements_array = Array.from(pb_elements);

/*
##################################################################
check if osd viewer is visible or not
if true get width from sibling container
if false get with from sibling container divided by half
height is always the screen height minus some offset
##################################################################
*/

container.style.height = `${String(height / 2)}px`;
// set osd wrapper container width
var container = document.getElementById("section");
if (container !== null) {
  var width = container.clientWidth;
}
var container = document.getElementById("viewer");
if (!wrapper.classList.contains("fade")) {
    container.style.width = `${String(width - 25)}px`;
} else {
    container.style.width = `${String(width / 2)}px`;
}

/*
##################################################################
Go home
##################################################################
*/

viewer.viewport.goHome = function () {
	fitVertically_align_left_bottom();
  a_elements[0].scrollIntoView();
  var next_pb_index = 0;
  var previous_pb_index = 0;
}

function fitVertically_align_left_bottom(){
  let initial_bounds = viewer.viewport.getBounds();
  let ratio = initial_bounds.width / initial_bounds.height;
  let tiledImage = viewer.world.getItemAt(viewer.world.getItemCount()-1);
  if (ratio > tiledImage.contentAspectX) {
    var new_width = tiledImage.normHeight * ratio;
    var new_bounds = new OpenSeadragon.Rect(0, 0 , new_width, tiledImage.normHeight)
   
  } else {
    var new_height = 1 / ratio;
    let bounds_y = -(new_height - tiledImage.normHeight);
    var new_bounds = new OpenSeadragon.Rect(0, bounds_y, 1, new_height);
  }
  viewer.viewport.fitBounds(new_bounds, true);
}

/*
##################################################################
index and previous index for click navigation in osd viewer
locate index of anchor element
##################################################################
*/
var next_pb_index = 0;
var previous_pb_index = 0;
const a_elements = document.getElementsByClassName("pb");
const max_index = (a_elements.length - 1);
prev = document.querySelector("div[title='Previous page']");
next = document.querySelector("div[title='Next page']");

// var prev = document.getElementById("osd_prev_button");
// var next = document.getElementById("osd_next_button");


/*
##################################################################
function to check if element is anywhere in window viewport
##################################################################
*/
function isInViewportAll(element) {
  // Get the bounding client rectangle position in the viewport
  var bounding = element.getBoundingClientRect()  ;


  // Checking part. Here the code checks if el is close to top of viewport.
  if (
      bounding.top >= 0 &&
      bounding.left >= 0 &&
      bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight  ) &&
      bounding.right <= (window.innerWidth || document.documentElement.clientWidth )
  ) {
      return true;
      
  } else {
      return false;
  }
}




/*
##################################################################
function to trigger image load and remove events
##################################################################
*/
function loadNewImage(new_item) {
  if (new_item) {
      // source attribute hold image item id without url
      var new_image = new_item.getAttribute("source");
      var old_image = viewer.world.getItemAt(0);
      if (old_image) {
          // get url from current/old image and replace the image id with
          // new id of image to be loaded
          // access osd viewer and add simple image and remove current image
          viewer.addSimpleImage({
              url: new_image,
              success: function(event) {
                  function ready() {
                      setTimeout(() => {
                          viewer.world.removeItem(viewer.world.getItemAt(0));
                      }, 200)
                  }
                  // test if item was loaded and trigger function to remove previous item
                  if (event.item) {
                      // .getFullyLoaded()
                      ready();
                  } else {
                      event.item.addOnceHandler('fully-loaded-change', ready());
                  }
              }
          });
      }
  }
}


/*
##################################################################
accesses osd viewer prev and next button to switch image and
scrolls to next or prev span element with class pb (pagebreak)
##################################################################
*/
var element_a = document.getElementsByClassName('pb');
var prev = document.querySelector("div[title='Previous page']");
var next = document.querySelector("div[title='Next page']");
prev.style.opacity = 1;
next.style.opacity = 1;

prev.addEventListener("click", () => {
    if (prev_idx >= 0) {
        element_a[prev_idx].scrollIntoView();
    } else {
        element_a[0].scrollIntoView();
    }
});


next.addEventListener("click", () => {
    if (prev_idx < element_a.length) {
        element_a[idx].scrollIntoView();
    } else {
        element_a[idx-1].scrollIntoView();
    }
    
});


/*
##################################################################
function to check if element is close to top of window viewport
##################################################################
*/
function isInViewport(element) {
  // Get the bounding client rectangle position in the viewport
  var bounding = element.getBoundingClientRect();
  // Checking part. Here the code checks if el is close to top of viewport.
  // console.log("Top");
  // console.log(bounding.top);
  // console.log("Bottom");
  // console.log(bounding.bottom);
  if (
      bounding.top <= 1200 &&
      bounding.bottom <= 600 &&
      bounding.top >= 20 &&
      bounding.bottom >= 20
  ) {
      return true;
  } else {
      return false;
  }
}