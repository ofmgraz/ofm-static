/*this cfg describes some of the features of the leaflet map and it't functions*/
const columns = [
  {
    headerFilter: "input",
    title: "name",
    field: "name",
    formatter: "plaintext",
    resizable: false,
  },
  {
    title: "lat",
    field: "lat",
    formatter: "plaintext",
    resizable: false,
  },
  {
    title: "lng",
    field: "lng",
    formatter: "plaintext",
    resizable: false,
  },
  {
    headerFilter: "input",
    title: "mentions",
    field: "mentions",
    resizable: false,
    formatter: function (cell) {
      return build_linklist_cell(this, cell);
    },
  },
];
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
/* using localization to change labels 
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
    the tabulator table and it't functions */
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

const table_cfg = {
  tabulator_cfg: tabulator_cfg,
  table_div_html_id: "#placesTable",
};
