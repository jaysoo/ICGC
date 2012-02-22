(function(Search) {

//~ Models and Collections ========================================================================

Search.Models.Search = Backbone.Model.extend({
    defaults: {
        count: 0,
        size: 20,
        from: 0
    }
});


//~ Views =========================================================================================

Search.Views.SearchView = Backbone.View.extend({
    events: {
        'submit': 'onSubmit'
    },

    matchAll: { match_all: {} },

    initialize: function(options) {
        options = options || {};

        _.bindAll(this, 'search');
        this.collection.on('change:values', this.search);
        this.model.on('change', this.search);

        this._queryString = options.queryString;
        this._queryFacets = options.queryFacets;
    },

    onSubmit: function() {
        var that = this,
            qs = this.el.value;

        this.collection.each(function(model) {
        });

        return false;
    },

    search: function() {
        var that = this,
            filters = [],
            query = this.matchAll,
            payload = { query: {} };


        // Build "and" filters
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

        var jsonString = JSON.stringify(payload);

        // TODO: Can do this as a Model.sync maybe?
        if (this.jsonString != jsonString) {
            $.ajax({
                url: '/api/search',
                data: {
                    source: JSON.stringify(payload)
                },
                success: function(response) {
                    var hits = DCC.hits(response),
                        facets = DCC.facets(response);
                    DCC.Documents.reset(hits);
                    that.model.set({ count: response.hits.total });
                }
            });
        }

        this.jsonString = jsonString;
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
            count: this.model.get('count')
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

