//~ DCC namespace and helper functions ============================================================
window.DCC = {
    /*
     * Memoized function for loading required modules.
     *
     * The first time a module is called via DCC.module(name), it will be empty. Any subsequent calls for that module will return the previous object.
     */
    module: _.memoize(function() {
        return { Views: {}, Models: {} };
    }),

    /*
     * Helper method for pulling out hits data from an elasticsearch response.
     */
    hits: function(response) {
        return _.map(response.hits.hits, function(hit) {
            return _.extend({}, hit._source, { id: hit._id });
        });
    },

    /*
     * Helper method for pulling out facets data from an elasticsearch response.
     */
    facets: function(response) {
        var facets = [];

        for (var k in response.facets) {
            facets.push( _.extend({
                id: k
            }, response.facets[k]) );
        }

        return facets;
    },

    /*
     * Mixins that can be used to extend a Backbone Model/View with reusable functions.
     *
     * Usage example:
     * var MyPaginationModel = Backbone.Model.extend({ ... });
     * _.extend(MyPaginationModel.prototype, DCC.Mixins.Pagination);
     */
    Mixins: {
        Pagination: {
            pages: function(active, end, size, pagesToDisplay) {
                var pages = [],
                    start = Math.max(active - pagesToDisplay / 2, 1);

                for (var i = start, count = 0; i <= end && count < pagesToDisplay; i++, count++) {
                    pages.push({
                        num: i,
                        active: i == active
                    });
                }

                return pages;
            }
        }
    }
};

(function() {

var Document = DCC.module('document'),
    Facet = DCC.module('facet'),
    Search = DCC.module('search');

//~ Sidebar view for aside content ================================================================
DCC.SidebarView = Backbone.View.extend({
    initialize: function(options) {
        options = options || {};

        _.bindAll(this, 'render');

        this.facets = new Facet.Views.FacetsView({
            collection: DCC.Facets
        });
    },

    render: function() {
        this.facets.render().$el.appendTo( this.el );
    },
});

//~ Main view  for middle content =================================================================
DCC.MainView = Backbone.View.extend({
    blockUiOptions: {
        message: '<span class="loading"></span>',

        overlayCSS:  { 
            backgroundColor: '#fff', 
            opacity: 0.6 
        },

        css: { 
            border: 'none',
            padding: 0, 
            margin: 0
        }
    },

    initialize: function() {
        _.bindAll(this, 'updatePosition', 'setSearchToPageZero', 'blockElement', 'unblockElement');

        this.$window = $(window);
        this.$subnav = $('#subnav');
        this.$window.bind('scroll', _.throttle(this.updatePosition, 25));
        this.subnavTop = this.$subnav.offset().top - 40;

        // Sub views
        this.search = new Search.Views.SearchView({
            el: $('#search'),
            model: DCC.Search,
            collection: DCC.Facets,
            queryString: DCC.query,
            queryFacets: DCC.queryFacets,
            beforeSearch: this.blockElement,
            afterSearch: this.unblockElement
        });

        this.stats = new Search.Views.StatsView({
            model: DCC.Search,
            collection: DCC.Documents
        });

        this.documents = new Document.Views.DocumentsView({
            collection: DCC.Documents
        });

        this.pagination = new Search.Views.PaginationView({
            model: DCC.Search
        });

        // Go back to first page when facet is updated.
        DCC.Facets.on('change:values', this.setSearchToPageZero);
    },

    updatePosition: function() {
        var scrollTop = this.$window.scrollTop();

        if (scrollTop >= this.subnavTop)
            this.$subnav.addClass('subnav-fixed');
        else
            this.$subnav.removeClass('subnav-fixed');
    },

    render: function() {
        this.stats.render().$el.appendTo( $('#stats') );

        this.documents.render().$el.appendTo(this.el);

        this.pagination.render().$el.appendTo(this.el);
    },

    blockElement: function() {
        this.$el.block(this.blockUiOptions);
    },

    unblockElement: function() {
        this.$el.unblock();
    },

    setSearchToPageZero: function() {
        DCC.Search.set({ from: 0 }, { silent: true });
    }
});

//~ Initialize application ========================================================================

DCC.AppView = Backbone.View.extend({
    render: function() {
        this.content = new DCC.MainView({ el: $('#application') }).render();
        this.sidebar = new DCC.SidebarView({ el: $('#facets') }).render();
    }
});

})();
