window.DCC = {
    module: _.memoize(function() {
        return { Views: {}, Models: {} };
    }),

    hits: function(response) {
        return _.map(response.hits.hits, function(hit) {
            return _.extend({}, hit._source, { id: hit._id });
        });
    },

    facets: function(response) {
        var facets = [];

        for (var k in response.facets) {
            facets.push( _.extend({
                id: k
            }, response.facets[k]) );
        }

        return facets;
    },

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

DCC.SidebarView = Backbone.View.extend({
    initialize: function() {
        _.bindAll(this, 'render', 'resetSearch');

        DCC.Facets.on('change:values', this.resetSearch);

        this.search = new Search.Views.SearchView({
            el: $('#search'),
            model: DCC.Search,
            collection: DCC.Facets,
            queryString: DCC.query,
            queryFacets: DCC.queryFacets
        });

        this.facets = new Facet.Views.FacetsView({
            collection: DCC.Facets
        });
    },

    render: function() {
        this.facets.render().$el.appendTo( $('#facets') );
    },

    resetSearch: function() {
        DCC.Search.set({ from: 0 }, { silent: true });
    }
});

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

DCC.AppView = Backbone.View.extend({
    render: function() {
        this.content = new DCC.MainView({ el: $('#application') }).render();
        this.sidebar = new DCC.SidebarView({ el: $('#sidebar') }).render();
    }
});

})();
