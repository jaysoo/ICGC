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
    }
};


(function() {

var Document = DCC.module('document'),
    Facet = DCC.module('facet'),
    Search = DCC.module('search');

DCC.SidebarView = Backbone.View.extend({
    render: function() {
        this.search = new Search.Views.SearchView({
            el: $('#q'),
            collection: DCC.Facets,
            queryString: DCC.query,
            queryFacets: DCC.queryFacets
        });

        this.facets = new Facet.Views.FacetsView({
            collection: DCC.Facets
        }).render().$el.appendTo(this.$('#facets'));
    }
});

DCC.MainView = Backbone.View.extend({
    render: function() {
        this.documents = new Document.Views.DocumentsView({
            collection: DCC.Documents
        }).render().$el.appendTo(this.el);
    }
});

DCC.AppView = Backbone.View.extend({
    render: function() {
        this.content = new DCC.MainView({ el: $('#application') }).render();
        this.sidebar = new DCC.SidebarView({ el: $('#sidebar') }).render();
    }
});

})();
