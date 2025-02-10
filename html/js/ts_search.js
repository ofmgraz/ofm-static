var project_collection_name = "ofm_graz"
const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: "ZxR05vexNYJIpy6xEJOFANuEUuWgX4d6",
    nodes: [
      {
        host: "typesense.acdh-dev.oeaw.ac.at",
        port: "443",
        protocol: "https",
      },
    ],
  },
  // The following parameters are directly passed to Typesense's search API endpoint.
  //  So you can pass any parameters supported by the search endpoint below.
  //  query_by is required.
  //  filterBy is managed and overridden by InstantSearch.js. To set it, you want to use one of the filter widgets like refinementList or use the `configure` widget.
  additionalSearchParameters: {
    query_by: "full_text",
  },
});

const searchClient = typesenseInstantsearchAdapter.searchClient;
const search = instantsearch({
  indexName: project_collection_name,
  searchClient: typesenseInstantsearchAdapter.searchClient,
  searchFunction(helper) {
    // Only trigger the search if the query has 1 or more characters
    if (helper.state.query.length > 0) {
      helper.search();
    }
  }
});


// This article:
// https://stackoverflow.com/questions/21246818/how-to-get-the-base-url-in-javascript

var base_url = window.location.origin;
// "http://stackoverflow.com"

var host = window.location.host;
// stackoverflow.com

var pathArray = window.location.pathname.split( '/' );
var base_url = pathArray[1]

function isNumeric(value) {
    return /^-?\d+$/.test(value);
}

function formatDate(timestamp) {
	if (isNumeric(timestamp)) {
	var date = new Date(timestamp * 1000)
	let year = date.getFullYear()
	let month  = date.getMonth() + 1
	let day = date.getDay() + 1
	date = day + "-" + month + "-" + year ;
	} else
	{
		date = timestamp }
  return date
}


function getYear(timestamp) {
  year = timestamp
  if (isNumeric(timestamp)) {
    const date = new Date(timestamp * 1000)
    year = date.getFullYear()
  }
  return year
}

function renameLabel(label) {
  // Rename MC to Multiple Choice
  if(label === 'notbefore'){
          label = 'Datum'
      }
  if(label === 'title'){
	  label = 'Titel'
  }
if(label === 'form'){
	  label = 'Art'
  }
	if(label === 'provenance'){
	  label = 'Herkunft'
  }
	if(label === 'liturgy'){
	  label = 'Liturgie'
  }
	if(label === 'printer'){
	  label = 'Drucker'
  }
	if(label === 'doc_type'){
	  label = 'Dokumententyp'
  }
  if(label === 'persons'){
    label = 'Personen'
  }
  return label
}

// Add this before search.addWidgets([...])
const searchState = {
  fuzzySearch: false
};

search.addWidgets([
  // Add this as first widget
  {
    init(options) {
      const container = document.querySelector("#fuzzy-toggle");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = "fuzzy-search";
      checkbox.className = "mr-2";
      checkbox.checked = searchState.fuzzySearch;
      
      const label = document.createElement("label");
      label.htmlFor = "fuzzy-search";
      label.textContent = "Unscharfe Suche";
      label.className = "form-check-label";
      
      const wrapper = document.createElement("div");
      wrapper.className = "form-check mb-3";
      wrapper.appendChild(checkbox);
      wrapper.appendChild(label);
      
      container.appendChild(wrapper);

      checkbox.addEventListener("change", (e) => {
        searchState.fuzzySearch = e.target.checked;
        options.refresh();
      });
    }
  },

  instantsearch.widgets.searchBox({
    placeholder: 'Textsuche',
    query: 'Textsuche' ,
    container: "#searchbox",
    autofocus: true,
    cssClasses: {
      form: "form-inline",
      input: "form-control col-md-11",
      submit: "btn",
      reset: "btn",
    },
  }),
// workaround for URL. Top be solved in the indexer
  instantsearch.widgets.hits({
    container: "#hits",
    templates: {
      empty: "Keine Resultate für <q>{{ query }}</q>",
      item: `
              <h5><a href="{{base_url}}{{resolver}}{{anchor_link}}" target="_blank">{{#helpers.snippet}}{ "attribute": "title", "highlightedTagName": "mark" }{{/helpers.snippet}}</a></h5>
              <p style="overflow:hidden;max-height:210px;">{{#helpers.snippet}}{ "attribute": "context", "highlightedTagName": "mark" }{{/helpers.snippet}}</p>
              <!-- <h5><span class="badge badge-primary">{{ project }}</span></h5> -->
          `,
    },
  }),

  instantsearch.widgets.pagination({
    container: "#pagination",
  }),

  instantsearch.widgets.stats({
    container: "#stats-container",
    templates: {
      text: `
            {{#areHitsSorted}}
              {{#hasNoSortedResults}}keine Treffer{{/hasNoSortedResults}}
              {{#hasOneSortedResults}}1 Treffer{{/hasOneSortedResults}}
              {{#hasManySortedResults}}{{#helpers.formatNumber}}{{nbSortedHits}}{{/helpers.formatNumber}} Treffer {{/hasManySortedResults}}
              aus {{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}}
            {{/areHitsSorted}}
            {{^areHitsSorted}}
              {{#hasNoResults}}keine Treffer{{/hasNoResults}}
              {{#hasOneResult}}1 Treffer{{/hasOneResult}}
              {{#hasManyResults}}{{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}} Treffer{{/hasManyResults}}
            {{/areHitsSorted}}
            gefunden in {{processingTimeMS}}ms
          `,
    },
  }),

  instantsearch.widgets.panel({
    collapsed: ({ state }) => {
      return state.query.length === 0;
    },  
    templates: {
      header: 'Liturgie',
    },  
  })(instantsearch.widgets.refinementList)({
    container: "#refinement-list-liturgie",
    attribute: "liturgy",
    searchable: false,
    cssClasses: {
      searchableInput: "form-control form-control-sm mb-2 border-light-2",
      searchableSubmit: "d-none",
      searchableReset: "d-none",
      showMore: "btn btn-secondary btn-sm align-content-center",
      list: "list-unstyled",
      count: "badge ml-2 badge-secondary hideme ",
      label: "d-flex align-items-center text-capitalize",
      checkbox: "mr-2",
    },
  }),

  instantsearch.widgets.panel({
    collapsed: ({ state }) => {
      return state.query.length === 0;
    },  
    templates: {
      header: 'Dokumententyp',
    },  
  })(instantsearch.widgets.refinementList)({
    container: "#refinement-list-genre",
    attribute: "form",
    searchable: false,
    operator: "and",
    cssClasses: {
      searchableInput: "form-control form-control-sm mb-2 border-light-2",
      searchableSubmit: "d-none",
      searchableReset: "d-none",
      showMore: "btn btn-secondary btn-sm align-content-center",
      list: "list-unstyled",
      count: "badge ml-2 badge-secondary hideme ",
      label: "d-flex align-items-center text-capitalize",
      checkbox: "mr-2",
    },
  }),

  instantsearch.widgets.panel({
    collapsed: ({ state }) => {
      return state.query.length === 0;
    },  
    templates: {
      header: 'Herkunft',
    },  
  })(instantsearch.widgets.refinementList)({
    container: "#refinement-list-place",
    attribute: "provenance",
    searchable: false,
    cssClasses: {
      searchableInput: "form-control form-control-sm mb-2 border-light-2",
      searchableSubmit: "d-none",
      searchableReset: "d-none",
      showMore: "btn btn-secondary btn-sm align-content-center",
      list: "list-unstyled",
      count: "badge ml-2 badge-secondary hideme ",
      label: "d-flex align-items-center text-capitalize",
      checkbox: "mr-2",
    },
  }),

  instantsearch.widgets.panel({
    collapsed: ({ state }) => {
      return state.query.length === 0;
    },  
    templates: {
      header: 'Drucker',
    },  
  })(instantsearch.widgets.refinementList)({
    container: "#refinement-list-persons",
    attribute: "printer",
    searchable: false,
    operator: "and",
    cssClasses: {
      searchableInput: "form-control form-control-sm mb-2 border-light-2",
      searchableSubmit: "d-none",
      searchableReset: "d-none",
      showMore: "btn btn-secondary btn-sm align-content-center",
      list: "list-unstyled",
      count: "badge ml-2 badge-secondary hideme ",
      label: "d-flex align-items-center text-capitalize",
      checkbox: "mr-2",
    },
  }),


  instantsearch.widgets.panel({
    templates: {
      header: 'Jahr',
    },
  })(instantsearch.widgets.rangeSlider)({
      container: "#refinement-range-year",
      attribute: "notbefore",
      pips: false,
      tooltips: {
        format: v => getYear(v),
      }, 
      cssClasses: {
        form: "form-inline",
        input: "form-control",
        submit: "btn",
      },
    }),

  instantsearch.widgets.pagination({
    container: "#pagination",
    padding: 2,
    cssClasses: {
      list: "pagination",
      item: "page-item",
      link: "page-link",
    },
  }),

  instantsearch.widgets.clearRefinements({
    container: "#clear-refinements",
    templates: {
      resetLabel: "Filter zurücksetzen",
    },
    cssClasses: {
      button: "btn",
    },
  }),

  instantsearch.widgets.currentRefinements({
    container: "#current-refinements",
    cssClasses: {
      delete: "btn",
      label: "badge",
    },                                                                                                                                                                                                                                                         
    transformItems(items) {
      return items.map(
        item => (
          {   
            ...item,
            label: renameLabel(item.label),
            refinements: item.refinements.map(
              iitem => (
                {...iitem,
                label: getYear(iitem.value),}
              ),  
            ),  
          }   
        ),  
      ) ; 
    },  
  }), 

  /*instantsearch.widgets.sortBy({
    container: "#sort-by",
    items: [
      { label: "standard", value: `${project_collection_name}` },
      { label: "chronologisch", value: `${project_collection_name}/sort/creation_date:asc, bv_doc_id_num:asc, doc_internal_orderval:asc` },
      { label: "umgekehrt chronologisch", value: `${project_collection_name}/sort/creation_date:desc, bv_doc_id_num:asc, doc_internal_orderval:asc` },
    ],
  }),*/

  instantsearch.widgets.configure({
    hitsPerPage: 12,
    attributesToSnippet: ["context"],
    typoTolerance: () => searchState.fuzzySearch ? 'true' : 'false'
  }),

]);
search.start();
