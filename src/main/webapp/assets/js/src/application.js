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
    }
};


(function() {

var Core = DCC.module('core');

DCC.SidebarView = Backbone.View.extend({
    render: function() {
        this.search = new Core.Views.SearchView({
            el: $('#q'),
            collection: DCC.Facets,
            queryString: DCC.query,
            queryFacets: DCC.queryFacets
        }).render().$el.appendTo(this.$el);

        this.facets = new Core.Views.FacetsView({
            collection: DCC.Facets
        }).render().$el.appendTo(this.$('#facets'));
    }
});

DCC.ContentView = Backbone.View.extend({
    render: function() {
        this.documents = new Core.Views.DocumentsView({
            collection: DCC.Documents
        }).render().$el.appendTo(this.el);
    }
});

DCC.AppView = Backbone.View.extend({
    render: function() {
        this.content = new DCC.ContentView({ el: $('#application') }).render();
        this.sidebar = new DCC.SidebarView({ el: $('#sidebar') }).render();
    }
});

})();
