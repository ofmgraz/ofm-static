function handle_the_handler(off_canvas_id) {
    let offcanvas_container_div = document.getElementById(off_canvas_id);
    const hideCanvas = (event) => {
      let openedCanvas = bootstrap.Offcanvas.getInstance(offcanvas_container_div);
      openedCanvas.hide();
      event.target.removeEventListener('mouseleave', hideCanvas);
    }
    const listenToMouseLeave = (event) => {
      event.target.addEventListener('mouseleave', hideCanvas);
    }
    offcanvas_container_div.addEventListener('shown.bs.offcanvas', listenToMouseLeave);
  }



/*window.addEventListener("load", function() {
  let disclaimer = document.getElementById("text_quality_disclaimer");
  let openedCanvas = bootstrap.Offcanvas.getInstance(disclaimer);
  openedCanvas.hide();
});*/

  //function call
  handle_the_handler('offcanvasNavigation');
  // rather annoying to use it there
