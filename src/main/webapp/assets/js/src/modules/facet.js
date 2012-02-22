(function(Facet) {

//~ Models and Collections ========================================================================

Facet.Models.Facet = Backbone.Model.extend({
    defaults: { values: null },

    /*
     * Generates one or more filters from this facet.
     */
    filters: function() {
        var values = this.get('values');

        if (!values || !values.length)
            return [];

        var arr = [],
            that = this;

        switch (this.get('_type')) {
        case 'terms':
            (function() {
                var terms = [],
                    field = {};
                _.each(values, function(value) {
                    terms.push(value);
                });
                field[that.id] = terms;
                arr.push({ terms: field });
            })();
            break;
        }

        return arr;
    }
});

Facet.Models.Facets = Backbone.Collection.extend({
    model: Facet.Models.Facet
});

//~ Views =========================================================================================
//
Facet.Views.FacetView = Backbone.View.extend({
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

    _onChange: function(ev) {
        var values = [],
            $target = $(ev.target);

        if ($target.data('action') == 'clear') {
            this.clear();
        } else {
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
    },

    clear: function() {
       var that = this;
        this.model.set({ values: null });
        this.$('li :checkbox').each(function() {
            this.checked = $(this).data('action') == 'clear';
        });
    }
});

Facet.Views.FacetsView = Backbone.View.extend({
    tagName: 'ul',

    initialize: function() {
        _.bindAll(this, 'render');
        this.collection.bind('reset', this.render);
    },

    subViews: {},

    render: function() {
        var that = this;

        _.each(this.subViews, function(view, key) {
            view.remove();
        });
        this.subViews = {};

        this.collection.each(function(model) {
            that.subViews[model.id] = new Facet.Views.FacetView({
                model: model
            }).render();
            that.subViews[model.id].$el.appendTo(that.el);
        });

        return this;
    }
});

})(DCC.module('facet'));
