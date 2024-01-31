/*this cfg describes some of the features of the leaflet map and it't functions*/
/*its used to define how make_map_and_table.js build a tabulator table and a leaflet
map from data of an html table*/

/*this defines some features of the leaflet map
his simply is passed over to leaflet, consult docs
for more info */
const map_cfg = {
    div_id: "places_div",
    json_url: "",
    initial_zoom: "5",
    max_zoom: "19",
    /* zomm level for a place on the map focused by clicking the corresponding row */
    on_row_click_zoom: "11",
    initial_coordinates: [48.210033, 16.363449],
    base_map_url:
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    /* some map providers need subdomains */
    subdomains: "abcd",
    attribution:
      '&amp;copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &amp;copy <a href="https://carto.com/attributions">CARTO</a>',
  };

/*provide a list of your table columns and what tabulator should do with it
this simply is passed over to tabulator, consult docs for more info */
const columns = [
    /* the following field is necessary, 
    provide a string val in your html-table */
  {
    headerFilter: "input",
    title: "name",
    field: "name",
    formatter: "plaintext",
    resizable: false,
  },
    /* the following fields are necessary, 
    provide a string val each in your html-table,
    (longitude and latitude)*/
  {
    title: "lat",
    field: "lat",
    formatter: "plaintext",
    resizable: false,
	   visible: false,
  },
  {
    title: "lng",
    field: "lng",
    formatter: "plaintext",
    resizable: false,
	  visible: false,
  },
  {
    headerFilter: "input",
    title: "related_objects",
    field: "related_objects",
    resizable: false,
    formatter: "html",
  },
	  {
    //headerFilter: "input",
    title: "authority",
    field: "authority",
    resizable: false,
    formatter: "html",
  },
];

/* using localization to change labels of tabulators pagination
    https://tabulator.info/docs/5.5/modules#module-localize */
const langs = {
  default: {
    pagination: {
      counter: {
        showing: "",
        of: "of",
        rows: "",
      },
    },
  },
};

/* this cfg describes some of the features of
    the tabulator table and it't functions 
    consult tabulator docs for more info*/
const tabulator_cfg = {
  maxHeight: "45vh",
  layout: "fitColumns",
  width: "100%",
  headerFilterLiveFilterDelay: 600,
  responsiveLayout: "collapse",
  paginationCounter: "rows",
  pagination: "local",
  paginationSize: 10,
  langs: langs,
  columns: columns,
};

/*this is just an extra capsule to pass cfg trough the functions*/
const table_cfg = {
  tabulator_cfg: tabulator_cfg,
  /* put the id of the div-element you want tabulator to be rendered in */
  table_div_html_id: "#placesTable",
};


function draw_cirlce_from_rowdata(latLng, row) {
    /*provides a circular icon to be drawn on the map, radius is dermined by the amount
    of child elements in the related_objects column first ul child*/
    let radius = row.getCell("related_objects").getElement().children[0].childElementCount;
	let html_dot = "";
	let border_width = 4;
	let border_color = "red";
	let size = radius * 10;
	let icon_style = `style="width: ${size}px; height: ${size}px; border-radius: 50%; display: table-cell; border: ${border_width}px solid ${border_color};  background: rgba(255, 0, 0, .5); overflow: hidden; position: absolute"`;
	let iconSize = size;
	let icon = L.divIcon({
		html: `<span ${icon_style}>${html_dot}</span>`,
		className: "",
		iconSize: [iconSize, iconSize],
	});
	let marker = L.marker(latLng, {
		icon: icon,
	});
	return marker;
}

/*define the way you wish to draw icons on the map; 
per default the function takes the coordinates as [lat, lng]
from row.getData() and the row object as in the above example 
(draw_cirlce_from_rowdata) */
const draw_icon = draw_cirlce_from_rowdata;