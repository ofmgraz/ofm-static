let paginatorOptions = {
  //pagination: "local",
  //paginationSize: 15,
  layout: "fitDataStretch",
  responsiveLayout: "collapse",
  paginationCounter: "rows",
  langs: {
    default: {
      pagination: {
        counter: {
          showing: "",
          of: "von",
          rows: "",
        },
        pages: "pages",
        page_size: "Seitengröße", //label for the page size select element
        page_title: "Zeige Seite", //tooltip text for the numeric page button, appears in front of the page number (eg. "Show Page" will result in a tool tip of "Show Page 1" on the page 1 button)
        first: "Erste", //text for the first page button
        first_title: "Erste", //tooltip text for the first page button
        last: "Letzte",
        last_title: "Letzte",
        prev: "zurück",
        prev_title: "zurück",
        next: "vor",
        next_title: "vor",
        all: "alle"
      },
    },
  },
  columns: [
    {
      headerFilter: "input",
      title: "Titel",
      field: "Titel",
      formatter: "html",
    },
    {
      headerFilter: "input",
      title: "beteiligte Personen",
      field: "beteiligte Personen",
      formatter: "html",
    },
    {
      headerFilter: "input",
      title: "Dokumententyp",
      field: "Dokumententyp",
    },
    {
      headerFilter: "input",
      title: "Materialtyp",
      field: "Materialtyp",
    },
    {
      title: "Entstehung (tpq)",
      field: "Entstehung (tpq)",
    },
  ],
};
var table = new Tabulator("#tocTable", paginatorOptions);
/*
one could add a function to give a count of the total entrys, regardless of filter events
table.on("renderComplete", function(){
    let doc_counter = document.getElementById("doccounter");
    let footer = table.footerManager.element ;
});*/