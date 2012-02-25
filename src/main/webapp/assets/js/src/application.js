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

(function(Document, Facet, Search, Index) {

//~ Application view ==============================================================================
DCC.HeaderView = Backbone.View.extend({
    initialize: function(options) {
        options = options || {};

        _.bindAll(this, 'setSearchToPageZero', 'render', 'updatePosition', 'selectIndex', 'blockElement', 'unblockElement');


        // Make sure we're always visible on the page top
        this.$window = $(window);
        this.$window.bind('scroll', _.throttle(this.updatePosition, 25));
        this.headerTop = this.$el.offset().top - 40;

        // Sub views
        this.stats = new Search.Views.StatsView({
            el: this.$('.stats'),
            model: DCC.Search,
            collection: DCC.Documents
        });

        this.search = new Search.Views.SearchView({
            el: this.$('.form-search'),
            model: DCC.Search,
            collection: DCC.Facets,
            queryString: DCC.query,
            queryFacets: DCC.queryFacets,
            beforeSearch: this.blockElement,
            afterSearch: this.unblockElement
        });

        this.indices = new Index.Views.IndicesView({
            el: this.$('.indices'),
            collection: DCC.Indices
        });

        this.indices.on('selected', this.selectIndex);

        // Go back to first page when facet is updated.
        DCC.Facets.on('change:values', this.setSearchToPageZero);
    },

    render: function() {
        this.indices.render();
        this.stats.render();
        return this;
    },

    updatePosition: function() {
        var scrollTop = this.$window.scrollTop();

        if (scrollTop >= this.headerTop)
            this.$el.addClass('subnav-fixed');
        else
            this.$el.removeClass('subnav-fixed');
    },

    setSearchToPageZero: function() {
        DCC.Search.set({ from: 0 }, { silent: true });
    },

    selectIndex: function(model) {
        DCC.Search.set({
            index: model ? model.get('index') : null,
            type: model ? model.get('type') : null
        });
    },

    blockElement: function() {
        this.$el.block(this.blockUiOptions);
    },

    unblockElement: function() {
        this.$el.unblock();
    }
});

DCC.SidebarView = Backbone.View.extend({
    initialize: function(options) {
        options = options || {};

        _.bindAll(this, 'render');

        this.facets = new Facet.Views.FacetsView({
            collection: DCC.Facets
        });
    },

    render: function() {
        this.facets.render().$el.appendTo( this.$('.facets') );
        return this;
    },
});

DCC.MainView = Backbone.View.extend({
    blockUiOptions: {
        message: '<span class="loading"></span>',
        overlayCSS:  { backgroundColor: '#fff', opacity: 0.6 },
        css: { border: 'none', padding: 0, margin: 0 }
    },

    initialize: function() {
        this.documents = new Document.Views.DocumentsView({
            collection: DCC.Documents
        });

        this.pagination = new Search.Views.PaginationView({
            model: DCC.Search
        });

    },

    render: function() {
        this.documents.render().$el.appendTo(this.el);
        this.pagination.render().$el.appendTo(this.el);
    }
});

//~ Initialize application ========================================================================

DCC.AppView = Backbone.View.extend({
    render: function() {
        this.header = new DCC.HeaderView({ el: $('#app-header') }).render();
        this.content = new DCC.MainView({ el: $('#app-main') }).render();
        this.sidebar = new DCC.SidebarView({ el: $('#app-sidebar') }).render();
        return this;
    }
});

})( DCC.module('document'), DCC.module('facet'), DCC.module('search'), DCC.module('index') );
