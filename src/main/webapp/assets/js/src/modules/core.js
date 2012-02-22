(function(Core) {

//~ Models and Collections ========================================================================

Core.Models.Document = Backbone.Model.extend({
});

Core.Models.Documents = Backbone.Collection.extend({
    model: Core.Models.Document
});

Core.Models.Facet = Backbone.Model.extend({
    defaults: { values: null },

    filters: function() {
        var values = this.get('values');

        if (!values || !values.length)
            return [];

        var arr = [],
            that = this;

        switch (this.get('_type')) {
        case 'terms':
            _.each(values, function(value) {
                var term = {};
                term[that.id] = value;
                arr.push({"term" : term});
            });
            break;
        }

        return arr;
    }
});

Core.Models.Facets = Backbone.Collection.extend({
    model: Core.Models.Facet
});

//~ Views =========================================================================================

Core.Views.DocumentView = Backbone.View.extend({
    tagName: 'li',

    initialize: function() {
    },

    render: function() {
        var attrs = [];

        for (var k in this.model.attributes) {
            if (k != 'id')
                attrs.push({ name: k, value: this.model.attributes[k] });
        }

        this.$el.html( ich.documentTmpl({
            id: this.model.id,
            attributes: attrs
        }) );

        return this;
    }
});

Core.Views.DocumentsView = Backbone.View.extend({
    tagName: 'ul',

    _views: {},

    initialize: function() {
        _.bindAll(this, 'render');
        this.collection.bind('reset', this.render);
    },

    render: function() {
        var that = this;
        this.$el.empty();
        this.collection.each(function(model) {
            that._views[model.id] = new Core.Views.DocumentView({
                model: model
            }).render().$el.appendTo(that.el);
        });
        return this;
    }
});

Core.Views.FacetView = Backbone.View.extend({
    tagName: 'li',

    events: {
        'change :checkbox': '_onChange'
    },

    initialize: function() {
    },

    render: function() {
        switch (this.model.get('_type')) {
        case 'terms':
            this.$el.html( ich.facetTermsTmpl(this.model.toJSON()) );
            break;
        case 'range':
            this.$el.html( ich.facetRangeTmpl(this.model.toJSON()) );
            break;
        }
        return this;
    },

    _onChange: function() {
        var values = [];

        this.$(':checked').each(function() {
            var value = $(this).closest('li').data('value');
            if (value != '_all')
                values.push( value );
        });

        if (!values.length) {
            this.model.set({ values: null });
            this.$('li[data-value=_all] input')[0].checked = true;
        } else {
            this.model.set({ values: values });
            this.$('li[data-value=_all] input')[0].checked = false;
        }
    }
});

Core.Views.FacetsView = Backbone.View.extend({
    tagName: 'ul',

    initialize: function() {
        _.bindAll(this, 'render');
        this.collection.bind('reset', this.render);
    },

    _views: [],

    render: function() {
        var that = this;

        this.collection.each(function(model) {
            that._views[model.id] = new Core.Views.FacetView({
                model: model
            }).render().$el.appendTo(that.el);
        });

        return this;
    }
});

Core.Views.SearchView = Backbone.View.extend({
    events: {
        'submit': '_onSubmit'
    },

    _matchAll: '{ "match_all": {} }',

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
            query = { match_all: {} },
            payload = { query: {} };

        this.collection.each(function(model) {
            filters = filters.concat(model.filters());
        });

        if (filters.length) {
            payload.query = {
                filtered: {
                    query: query,
                    filter: {
                        or: {
                            filters: filters
                        }
                    }
                }
            };
        } else {
            payload.query = query;
        }

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

})(DCC.module('core'));
