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
        {field: "titel", title: "Titel", formatter: "html", responsive: "0", resizable: "true", minWidth: "380", headerFilter: "input"},
	{field: "xml-tei", title: "XML-TEI", responsive: "10", formatter: "html", visible: false},
	{field: "tpq", title: "TPQ", responsive: "1", resizable: "true", headerFilter: "input", minWidth: "100px", maxWidth: "100px"},
	{field: "taq", title: "TAQ", resizable: "true", headerFilter: "input", visible: false},
	{field: "liturgie", title: "Liturgie", responsive: "2", resizable: "true", headerFilter: "list", minWidth: "150px", maxWidth: "150px", headerFilterParams:
		{ valuesLookup: true, clearable: true },
	},
	{field: "dokumententyp", title: "Dokumententyp", responsive: "3", resizable: "true", headerFilter: "list", minWidth: "200px", headerFilterParams:
		{ valuesLookup: true, clearable: true },
	},
	{field: "provenienz", title: "Provenienz", formatter: "html", responsive: "11", headerFilter: "input"},
	{field: "drucker", title: "Drucker", responsive: "12", formatter: "html", resizable: "true", headerFilter: "list", visible: false},
	{field: "folia", title: "Folia", responsive: "13", resizable: "true", headerFilter: "input", visible: false},
	{field: "höhe_(mm)", title: "Höhe (mm)", responsive: "14", resizable: "true", headerFilter: "input", visible: false},
	{field: "breite_(mm)", title: "Breite (mm)", responsive: "15", resizable: "true", headerFilter: "input", visible: false},
	{field: "description", title: "Beschreibung", responsive: "16", resizable: "true", headerFilter: "input", visible: false},
	{field: "transkriptionsstatus", title: "Transkriptionsstatus", responsive: "17", resizable: "true", headerFilter: "list", visible: false, headerFilterParams:
		{ valuesLookup: true, clearable: true },
	},//set the initial value of the header filter to "red"
    ],
};