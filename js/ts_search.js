var project_collection_name = "bundes_verfassung_oesterreich"
const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: "9KuQLxkcSSBjYobV50wKv6KBJFz9DzjO",
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
    query_by: "full_text,title",
  },
});

const searchClient = typesenseInstantsearchAdapter.searchClient;
const search = instantsearch({
  searchClient,
  indexName: project_collection_name,
});

search.addWidgets([
  instantsearch.widgets.searchBox({
    container: "#searchbox",
    autofocus: true,
    cssClasses: {
      form: "form-inline",
      input: "form-control col-md-11",
      submit: "btn",
      reset: "btn",
    },
  }),

  instantsearch.widgets.hits({
    container: "#hits",
    templates: {
      empty: "Keine Resultate für <q>{{ query }}</q>",
      item: `
              <h5><a href="{{ anchor_link }}">{{#helpers.snippet}}{ "attribute": "title", "highlightedTagName": "mark" }{{/helpers.snippet}}</a></h5>
              <p style="overflow:hidden;max-height:210px;">{{#helpers.snippet}}{ "attribute": "full_text", "highlightedTagName": "mark" }{{/helpers.snippet}}</p>
              <h5><span class="badge badge-primary">{{ project }}</span></h5>
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

  instantsearch.widgets.refinementList({
    container: "#refinement-list-persons",
    attribute: "Personen",
    searchable: true,
    searchablePlaceholder: "Suchen",
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

  instantsearch.widgets.refinementList({
    container: "#refinement-list-doc-material",
    attribute: "Materialart",
    searchable: false,
    cssClasses: {
      showMore: "btn btn-secondary btn-sm align-content-center",
      list: "list-unstyled",
      count: "badge ml-2 badge-secondary hideme",
      label: "d-flex align-items-center text-capitalize",
      checkbox: "mr-2",
    },
  }),

  instantsearch.widgets.refinementList({
    container: "#refinement-list-doc-title",
    attribute: "Dokumententitel",
    searchable: true,
    searchablePlaceholder: "Suchen",
    cssClasses: {
      showMore: "btn btn-secondary btn-sm align-content-center",
      list: "list-unstyled",
      count: "badge ml-2 badge-secondary hideme",
      label: "d-flex align-items-center text-capitalize",
      checkbox: "mr-2",
    },
  }),

  instantsearch.widgets.refinementList({
    container: "#refinement-list-doc-type",
    attribute: "Dokumententyp",
    searchable: false,
    cssClasses: {
      showMore: "btn btn-secondary btn-sm align-content-center",
      list: "list-unstyled",
      count: "badge ml-2 badge-secondary hideme",
      label: "d-flex align-items-center text-capitalize",
      checkbox: "mr-2",
    },
  }),

  instantsearch.widgets.rangeInput({
    container: "#refinement-range-year",
    attribute: "creation_year",
    templates: {
      separatorText: "to",
      submitText: "Suchen",
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
    hitsPerPage: 8,
    attributesToSnippet: ["full_text"],
    //filters: function() { return document.getElementsByTagName("input").value },
  }),

]);

search.start();