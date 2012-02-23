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
        _.bindAll(this, 'render', 'resetSearch', 'blockElement', 'unblockElement');

        DCC.Facets.on('change:values', this.resetSearch);

        this.search = new Search.Views.SearchView({
            el: $('#search'),
            model: DCC.Search,
            collection: DCC.Facets,
            queryString: DCC.query,
            queryFacets: DCC.queryFacets,
            beforeSearch: this.blockElement,
            afterSearch: this.unblockElement
        });

        this.facets = new Facet.Views.FacetsView({
            collection: DCC.Facets
        });
    },

    render: function() {
        this.facets.render().$el.appendTo( $('#facets') );
    },

    blockElement: function() {
        $('#application').block(this.blockUiOptions);
    },

    unblockElement: function() {
        $('#application').unblock();
    },

    resetSearch: function() {
        DCC.Search.set({ from: 0 }, { silent: true });
    }
});

//~ Main view  for middle content =================================================================
DCC.MainView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, 'updatePosition');
        this.$window = $(window);
        this.$subnav = $('#subnav');
        this.$window.bind('scroll', _.throttle(this.updatePosition, 25));
        this.subnavTop = this.$subnav.offset().top - 40;
    },

    updatePosition: function() {
        var scrollTop = this.$window.scrollTop();

        if (scrollTop >= this.subnavTop)
            this.$subnav.addClass('subnav-fixed');
        else
            this.$subnav.removeClass('subnav-fixed');
    },

    render: function() {
        this.stats = new Search.Views.StatsView({
            model: DCC.Search,
            collection: DCC.Documents
        }).render();
        this.stats.$el.appendTo( $('#stats') );

        this.documents = new Document.Views.DocumentsView({
            collection: DCC.Documents
        }).render();
        this.documents.$el.appendTo(this.el);

        this.pagination = new Search.Views.PaginationView({
            model: DCC.Search
        }).render();
        this.pagination.$el.appendTo(this.el);
    }
});

//~ Initialize application ========================================================================

DCC.AppView = Backbone.View.extend({
    render: function() {
        this.content = new DCC.MainView({ el: $('#application') }).render();
        this.sidebar = new DCC.SidebarView({ el: $('#sidebar') }).render();
    }
});

})();
