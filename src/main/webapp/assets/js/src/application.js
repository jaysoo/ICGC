(function(Document, Facet, Search, Index) {

//~ Application views ==============================================================================

// Main application view that combines subviews into a single application
DCC.AppView = Backbone.View.extend({
    blockUiOptions: {
        message: '<span class="loading"></span>',
        overlayCSS:  { backgroundColor: '#fff', opacity: 0.6 },
        css: { border: 'none', padding: 0, margin: 0 }
    },

    initialize: function() {
        _.bindAll(this, 'blockElement', 'unblockElement');

        this.header = new DCC.HeaderView({ 
            el: $('#app-header'),
            beforeSearch: this.blockElement, // block out content during search
            afterSearch: this.unblockElement
        });

        this.content = new DCC.ContentView({ el: $('#app-main') });

        this.sidebar = new DCC.SidebarView({ el: $('#app-sidebar') });
    },

    render: function() {
        this.header.render();
        this.content.render();
        this.sidebar.render();
        return this;
    },

    blockElement: function() {
        this.content.$el.block(this.blockUiOptions);
    },

    unblockElement: function() {
        this.content.$el.unblock();
    }
});

// Top header view containg search bar and result information
DCC.HeaderView = Backbone.View.extend({
    initialize: function(options) {
        options = options || {};

        _.bindAll(this, 'setSearchToPageZero', 'render', 'updatePosition', 'selectIndex');

        // Optional callbacks when a search is performed
        this.beforeSearch = options.beforeSearch || $.noop;
        this.afterSearch = options.afterSearch || $.noop;


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
            beforeSearch: this.beforeSearch,
            afterSearch: this.afterSearch
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
    }
});

// Sidebar wiht facets
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

// Results content goes here
DCC.ContentView = Backbone.View.extend({
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

})( DCC.module('document'), DCC.module('facet'), DCC.module('search'), DCC.module('index') );
