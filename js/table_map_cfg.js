/*this cfg describes some of the features of the leaflet map and it't functions*/
/*its used to define how make_map_and_table.js build a tabulator table and a leaflet
map from data of an html table*/

/*this defines some features of the leaflet map
his simply is passed over to leaflet, consult docs
for more info */
const map_cfg = {
  div_id: "places_div",
  json_url: "",
  initial_zoom: "7",
  max_zoom: "20",
  /* zomm level for a place on the map focused by clicking the corresponding row */
  on_row_click_zoom: "5",
  initial_coordinates: [47.0708,15.4386],
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
  /* for the following, provide a list of related Objects, 
  eg. documents referencing the place represented by the row.
  place a ul-item with one li-children for each entity in your html-table*/
  {
    headerFilter: "input",
    title: "related_objects",
    field: "related_objects",
    resizable: false,
    formatter: "html",
  },
  /*the following could contain a ul of links to external authority data*/
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

/*optional you can define some wms config. If provided and passed to 
build_map_and_table a wms layer is added to your map,
including a layer controll;
if you don't need this, ignore it*/
let wms_cfg = {
    label: "Stadtplan 1858 (k.k. Ministerium des Inneren)",
    wms_url: "https://data.wien.gv.at/daten/wms?version=1.1.1",
    wmsOptions: {
        service: "WMS",
        version: "1.1.1",
        request: "GetMap",
        contextualWMSLegend: "0",
        crs: L.CRS.EPSG4326,
        dpiMode: "7",
        featureCount: "10",
        format: "image/png",
        layers: "HISTWIENPL1858OGD",
        url: "https://data.wien.gv.at/daten/wms?version%3D1.1.1",
        opacity: 0.5,
    },
};


//////////////////////////////////////////////////
/* some functions to influence the visualization*/
//////////////////////////////////////////////////

function draw_cirlce_from_rowdata(latLng, row) {
  /*provides a circular icon to be drawn on the map, radius is dermined by the amount
    of child elements in the related_objects column first ul child*/
  let radius = row.getCell("related_objects").getElement()
    .children[0].childElementCount;
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

/*define the way you wish to draw icons on the map in the make_map_and_table.js; 
per default the function takes the coordinates as [lat, lng]
from row.getData() and the row object as in the above example 
(draw_cirlce_from_rowdata)*/
const draw_icon = draw_cirlce_from_rowdata;


/*define the way you want to created an popup lable on the map
you have full acces to row data via row.getData() and can write html as in example below*/
function get_bold_name(row) {
	let label_string = `<b>${row.name}</b><br/>`;
	return label_string;
}

const get_popup_label_string_html = get_bold_name


/*some helpers*/

/*helper for scrollable cell, use in custom formatter in $columns*/

function make_cell_scrollable(table, cell, cell_html_string_in) {
	var cell_html_element = cell.getElement();
	cell_html_element.style.whiteSpace = "pre-wrap";
	cell_html_element.style.overflow = "auto";
	cell_html_element.style.maxHeight = "100px";
	if (cell_html_string_in !== undefined) {
		return table.emptyToSpace(cell_html_string_in);
	} else {
		return table.emptyToSpace(cell.getValue());
	}
}

/* this is a helper to provide you with a scrollable table cell, containing a list
use in custom formatter in $columns */
function build_linklist_cell(table, cell) {
	let values = cell.getValue();
	let i = 0;
	let links = [];
	while (i < values.length) {
		let pair = values[i];
		links.push(get_html_link(pair[0], pair[1]));
		i++;
	}
	let basic_html = get_html_list(links);
	return make_cell_scrollable(table, cell, basic_html);
}
