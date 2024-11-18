// holds shared config for all tabulator-js tables
//define lookup function
function paramLookup(cell){
    //do some processing and return the param object
    return {param1:"green"};
}

var config = {
    //height: 800,
    //minWidth: 700,
    // layout: "fitColumns",
    layout: "fitColumns",
    tooltips: true,
    dataLoader: true,
    responsiveLayout: true,
    columns :[
        {field: "titel", title: "Titel", formatter: "html", responsive: "0", resizable: "true", minWidth: "250px", headerFilter: "input", hozAlign: "left", headerHozAlign:"center"},
		{field: "signatur", title: "Signatur", formatter: "html", responsive: "0", resizable: "true", minWidth: "100px", headerFilter: "input", hozAlign: "left", headerHozAlign:"center"},
		{field: "xml-tei", title: "XML-TEI", responsive: "10", formatter: "html", visible: false},
		{field: "datum", title: "Datum", resizable: "true", headerFilter: "input", visible: true},
		{field: "liturgie", title: "Liturgie", responsive: "2", resizable: "true", headerFilter: "list", minWidth: "150px", maxWidth: "150px", headerFilterParams:
		{ valuesLookup: true, clearable: true },
		},
		{field: "provenienz", title: "Provenienz", formatter: "html", responsive: "11", headerFilter: "input", hozAlign: "left", headerHozAlign:"center"},
		{field: "drucker", title: "Drucker", responsive: "12", formatter: "html", resizable: "true", headerFilter: "list", visible: false},
		{field: "folia", title: "Folia", responsive: "13", resizable: "true", headerFilter: "input", visible: false},
		{field: "höhe_(mm)", title: "Höhe (mm)", responsive: "14", resizable: "true", headerFilter: "input", visible: false},
		{field: "breite_(mm)", title: "Breite (mm)", responsive: "15", resizable: "true", headerFilter: "input", visible: false},
		{field: "description", title: "Beschreibung", responsive: "16", resizable: "true", headerFilter: "input", visible: true},
		{field: "transkriptionsstatus", title: "Transkriptionsstatus", responsive: "17", resizable: "true", headerFilter: "list", minWidth: "250px", visible: false, headerFilterParams:
			{ valuesLookup: true, clearable: true },
		},//set the initial value of the header filter to "red"
    ],
};
