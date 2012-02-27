(function(Search) {

//~ Models and Collections ========================================================================

Search.Models.Search = Backbone.Model.extend({
    defaults: {
        count: 0,
        size: 10,
        from: 0,
        suggestions: 20,
        searchFields: null
    }
});


//~ Views =========================================================================================

Search.Views.SearchView = Backbone.View.extend({

    matchAll: { match_all: {} },

    events: {
        'change': 'search'
    },

    initialize: function(options) {
        options = options || {};

        _.bindAll(this, 'search', 'updateResults', 'onError', 'facetMatches', 'valueMatches', 'buildQuery');

        this.vs = VS.init({
          container: $("#q"),
          callbacks : {
            facetMatches : this.facetMatches,
            valueMatches : this.valueMatches
          }
        });

        // Bind to reset because this is the only way to get notified when the search is cleared.
        this.vs.searchQuery.on("reset", this.search);

        // Listen on Facet changes
        this.collection.on('change:values', this.search);
        this.model.on('change', this.search);

        this.queryFacets = options.queryFacets;

        // Setup callbacks for before and after searches
        this.beforeSearch = _.isFunction(options.beforeSearch)
            ? options.beforeSearch
            : $.noop;
        this.afterSearch = _.isFunction(options.afterSearch)
            ? options.afterSearch
            : $.noop;

        this.$errorMessage = ich.errorMessageTmpl({
            header: 'Error',
            body: 'An unexpected error has occurred. Please try again later'
        }).appendTo( this.el ).modal({ show: false });
    },

    // Fetch the available query facets
    facetMatches : function(callback) {
      callback(this.model.get('searchFields'));
    },

    // Fetch the values for a particular query facet
    valueMatches: function(facet, searchTerm, callback) {
      var index = this.model.get('index') || '',
          type = this.model.get('type') || '';

      var payload = {
          query: this.buildQuery({exclude:facet}),
          size: 0,
          facets: {
            the_facet: {
              terms: {
                field : facet,
                size  : this.model.get('suggestions'),
                regex : '(?=.*?' + searchTerm + ").*",
                regex_flags: "CASE_INSENSITIVE"
              }
            }
          }
      };

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
      .then(function(response) {
        var values = [];
        _.map(response.facets.the_facet.terms, function(t) {
          values.push(t.term);
        });
        callback(values, {preserveMatches:true});
      })
      .fail(this.onError);
    },

    /*
     * Called when error occurs during AJAX request.
     */
    onError: function(header, message) {
        this.$errorMessage.modal('show');
    },

    // Build the ES query: make a bool query out of the search box and a filter out of the selected facets
    buildQuery: function(options) {
      var options = options || {};

      var search = this.vs.searchQuery;
      if(options.exclude) {
        search = search.reject(function(item) {
          return item.get('category') == options.exclude;
        });
      }

      var query;
      if(search && search.length > 0) {
        var q = search.map(function(queryTerm) {
          switch(queryTerm.get('category')) {
          // special case for full-text search
          case 'text':
            return {query_string : {query: queryTerm.get('value')}};
          default:
            var term = {};
            term[queryTerm.get('category')] = queryTerm.get('value');
            return {term:term};
          }
        });
        query = {bool : {must : q}};
      } else {
        query = this.matchAll;
      }
      
      var filters = [];
      this.collection.each(function(model) {
          filters = filters.concat(model.filters());
      });
      
      if(filters.length) {
        return {
            filtered: {
              query : query,
              filter : {
                and: filters
              }
            }
          };
      }
      return query;
    },

    search: function(model, values, resetFacets) {
        var filters = [],
            query = this.buildQuery(),
            payload = { query: {}, facets: this.queryFacets };

        payload.query = query;
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

        DCC.Facets.update(facets);
        DCC.Documents.reset(hits);

        // TODO: this triggers another search call (see this.model.on("change", this.search) above).
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

