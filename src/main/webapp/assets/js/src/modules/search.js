(function(Search) {

//~ Models and Collections ========================================================================

Search.Models.Search = Backbone.Model.extend({
    defaults: {
        count: 0,
        size: 10,
        from: 0,
        queryString: null
    }
});


//~ Views =========================================================================================

Search.Views.SearchView = Backbone.View.extend({
    events: {
        'submit': 'onSubmit',
        'click .close': 'clear'
    },

    matchAll: { match_all: {} },

    areFacetsDirty: false,

    initialize: function(options) {
        options = options || {};

        VS.init({
          container: $("#search"),
          query: '',
          callbacks : {
            search       : function(query, searchCollection) {
              searchCollection.map(function(f) {
                console.log(f.serialize());
              })
            },
            facetMatches : function(callback) {
              callback(['gene_affected']);
            },
            valueMatches : function(facet, searchTerm, callback) {
              switch(facet) {
              case 'gene_affected':
                callback(['BRCA1', '339302'])
              }
            }
          }
        });

        _.bindAll(this, 'search', 'updateQueryString', 'updateResults', 'onError')
        
        this.collection.on('change:values', this.search);
        this.model
            .on('change:queryString', this.updateQueryString)
            .on('change', this.search);

        this.queryString = options.queryString;
        this.queryFacets = options.queryFacets;

        // Setup callbacks for before and after searches
        this.beforeSearch = _.isFunction(options.beforeSearch)
            ? options.beforeSearch
            : $.noop;
        this.afterSearch = _.isFunction(options.afterSearch)
            ? options.afterSearch
            : $.noop;

        this.$q = this.$('#q');

        this.$('.close').tooltip({ placement: 'right' });

        this.$errorMessage = ich.errorMessageTmpl({
            header: 'Error',
            body: 'An unexpected error has occurred. Please try again later'
        }).appendTo( this.el ).modal({ show: false });
    },

    onSubmit: function() {
        var that = this,
            qs = this.$q.val();

        // Need to reload facets
        this.areFacetsDirty = true;

        this.model.set({ queryString: qs || null });

        return false;
    },

    /*
     * Called when error occurs during AJAX request.
     */
    onError: function(header, message) {
        this.$errorMessage.modal('show');
    },

    clear: function() {
        // Need to reload facets
        this.areFacetsDirty = true;
        this.model.set({ queryString: null });
    },

    updateQueryString: function(model, value) {
        this.$q.val(value || '');
    },

    search: function(model, values, resetFacets) {
        var filters = [],
            query = this.model.get('queryString')
                ? { query_string: { query: this.model.get('queryString') } } 
                : this.matchAll,
            payload = { query: {}, facets: this.queryFacets };

        this.collection.each(function(model) {
            filters = filters.concat(model.filters());
        });

        if (filters.length) {
            // Do filtered query
            payload.query = {
                filtered: {
                    query: query,
                    filter: {
                        and: filters
                    }
                }
            };
        } else {
            // No filters
            payload.query = query;
        }

        payload.size = this.model.get('size');
        payload.from = this.model.get('from');

        var jsonString = JSON.stringify(payload),
            index = this.model.get('index') || '',
            type = this.model.get('type') || '';

        // TODO: Can do this as a Model.sync maybe?
        if (this.jsonString != jsonString || this.type != type || this.index != index) {
            // Callback before firing search request
            this.beforeSearch();

            $.when(
                $.ajax({
                    url: '/api/search',
                    data: {
                        source: JSON.stringify(payload),
                        index: index,
                        type: type
                    }
                })
            )
            // Callback after response returns
            .then( this.afterSearch )
            .fail( this.onError )
            .always( this.updateResults );
        }

        this.jsonString = jsonString;
        this.index = index;
        this.type = type;
    },

    updateResults: function(response) {
        var hits = DCC.hits(response),
            facets = DCC.facets(response);

        if (this.areFacetsDirty) {
            DCC.Facets.reset(facets);
            this.areFacetsDirty = false;
        }

        DCC.Documents.reset(hits);
        this.model.set({ count: response.hits.total });
    }
});

Search.Views.StatsView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, 'render');
        this.collection.on('reset', this.render);
        this.model.on('change', this.render);
    },

    render: function() {
        var start = this.model.get('from') + 1,
            size = this.model.get('size'),
            count = this.model.get('count'),
            end = Math.min(start + size - 1, count);

        this.$el.html( ich.statsTmpl({
            start: start,
            end: end,
            count: _.format(this.model.get('count'), { separateThousands: true })
        }) );

        return this;
    }
});

Search.Views.PaginationView = Backbone.View.extend({
    className: 'pagination',

    pagesToDisplay: 10,

    events: {
        'click a': 'changePage'
    },

    initialize: function() {
        _.bindAll(this, 'render');
        this.model.on('change', this.render);
    },

    render: function() {
        var count = this.model.get('count'),
            from = this.model.get('from'),
            size = this.model.get('size'),
            activePage = from / size + 1,
            end = Math.ceil(count / size),
            pages = this.pages(activePage, end, size, this.pagesToDisplay);

        this.$el.html( ich.paginationTmpl({
            "paginate?": pages.length > 1,
            "prev?":  activePage > 1,
            pages: pages,
            "next?":  activePage < end,
            prev: activePage - 1,
            next: activePage + 1
        }) );

        return this;
    },

    changePage: function(ev) {
        var $target = $(ev.target),
            page = $target.data('page'),
            size = this.model.get('size'),
            from = (page - 1) * size ;
        this.model.set({ from: from });
    }
});
_.extend(Search.Views.PaginationView.prototype, DCC.Mixins.Pagination);

})(DCC.module('search'));

