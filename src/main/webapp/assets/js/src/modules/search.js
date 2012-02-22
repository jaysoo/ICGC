(function(Search) {

//~ Models and Collections ========================================================================


//~ Views =========================================================================================

Search.Views.SearchView = Backbone.View.extend({
    events: {
        'submit': '_onSubmit'
    },

    matchAll: { match_all: {} },

    size: 20,

    from: 0,

    initialize: function(options) {
        options = options || {};

        _.bindAll(this, 'search');
        this.collection.bind('change:values', this.search);

        this._queryString = options.queryString;
        this._queryFacets = options.queryFacets;
    },

    _onSubmit: function() {
        var that = this,
            qs = this.el.value;

        this.collection.each(function(model) {
        });

        return false;
    },

    search: function() {
        var filters = [],
            query = this.matchAll,
            payload = { query: {} };

        this.collection.each(function(model) {
            filters = filters.concat(model.filters());
        });

        if (filters.length) {
            payload.query = {
                filtered: {
                    query: query,
                    filter: {
                        and: filters
                    }
                }
            };
        } else {
            payload.query = query;
        }

        payload.size = this.size;
        payload.from = this.from;

        $.ajax({
            url: '/api/search',
            data: {
                source: JSON.stringify(payload)
            },
            success: function(response) {
                var hits = DCC.hits(response),
                    facets = DCC.facets(response);
                DCC.Documents.reset(hits);
            }
        });
    }
});

})(DCC.module('search'));

