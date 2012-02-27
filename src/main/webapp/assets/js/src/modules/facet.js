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

        case 'range':
            var ranges = [];
            _.each(values, function(value) {
                var range = {};
                range[that.id] = _.extend({}, value);
                ranges.push({
                    range: range
                });
            });
            return [ { or : ranges } ];
            break;
        }

        return arr;
    },

    hasMissing: function() {
        return this.get('missing') > 0;
    }
});

Facet.Models.Facets = Backbone.Collection.extend({
    model: Facet.Models.Facet,

    initialize: function() {
        _.bindAll(this, 'update');
    },

    update: function(facets) {
      var that = this;
      _.each(facets, function(facet){
        var f = that.get(facet.id);
        facet.values = f.get('values');
        f.set(facet);
      });
    }
});

//~ Views =========================================================================================
//
Facet.Views.FacetView = Backbone.View.extend({
    tagName: 'li',

    events: {
        'change :checkbox': 'onChange'
    },

    initialize: function() {
        _.bindAll(this, 'getValue', 'update');
        this.model.on('change', this.update);
    },

    render: function() {
        switch (this.model.get('_type')) {
        case 'terms':
            console.log(this.model.hasMissing());
            console.log(this.model.toJSON());
            this.$el.html( ich.facetTermsTmpl(
              _.extend({ 'hasMissing?': this.model.hasMissing() }, this.model.toJSON())
            ) );
            break;
        case 'range':
            this.$el.html( ich.facetRangeTmpl(
              _.extend({ 'hasMissing?': this.model.hasMissing() }, this.model.toJSON())
            ) );
            break;
        }

        var el = this.$el;
        var all = this.$('li.all input');
        _.each(this.model.get('values'), function(term) {
          // Select using data-value: some terms contain css selectors (e.g.: >)
          $('li[data-value="'+term+'"] input', el).attr('checked', true);

          // Uncheck the "all" checkbox
          all.removeAttr('checked');
        });
        return this;
    },

    update: function() {
      // Reset everything to 0 because some facets may be missing (ES didn't return missing values) 
      this.$('small.count').html('0');

      var that = this;
      _.each(this.model.get('terms'), function(term) {
        that.$('li[data-value="'+term.term+'"] small.count').html(term.count);
      });
      _.each(this.model.get('ranges'), function(range) {
        if(range.to) {
          that.$('li[data-to="'+range.to+'"] small.count').html(range.count);
        } else {
          that.$('li[data-from="'+range.from+'"] small.count').html(range.count);
        }
      });
    },

    onChange: function(ev) {
        var that = this,
            values = [],
            $target = $(ev.target);

        if ($target.data('action') == 'clear') {
            this.clear();
        } else {
            this.$(':checked').each(function() {
                var value = that.getValue( $(this).closest('li') );
                if (value) {
                    values.push( value );
                }
            });

            if (!values.length) {
                this.model.set({ values: null });
                this.$('li.all input')[0].checked = true;
            } else {
                this.model.set({ values: values });
                this.$('li.all input')[0].checked = false;
            }
        }
    },

    getValue: function($li) {
        switch (this.model.get('_type')) {
        case 'terms':
            return $li.data('value');
        case 'range':
            var from = $li.data('from'),
                to = $li.data('to');

            if (!from && !to)
                return null;

            var range ={ from: from || 0 };
            to && ( range.to = to );
            return range;
        }
    },

    clear: function() {
       var that = this;
        this.$('li :checkbox').each(function() {
            this.checked = $(this).data('action') == 'clear';
        });
        this.model.set({ values: null });
    }
});

Facet.Views.FacetsView = Backbone.View.extend({
    tagName: 'ul',

    initialize: function() {
        _.bindAll(this, 'render');
        this.collection.on('reset', this.render);
    },

    subViews: {},
    
    render: function() {
        var that = this;

        _.each(this.subViews, function(view, key) {
            view.remove();
        });
        this.subViews = {};

        this.collection.each(function(model) {
            var view = that.subViews[model.id] = new Facet.Views.FacetView({
                model: model
            }).render();
            view.$el.appendTo(that.el);
        });

        return this;
    }
});

})(DCC.module('facet'));
