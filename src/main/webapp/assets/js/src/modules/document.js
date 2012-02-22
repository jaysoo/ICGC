(function(Document) {

//~ Models and Collections ========================================================================

Document.Models.Document = Backbone.Model.extend({
});

Document.Models.Documents = Backbone.Collection.extend({
    model: Document.Models.Document
});

//~ Views =========================================================================================

Document.Views.DocumentView = Backbone.View.extend({
    tagName: 'article',

    areDetailsShown: false,

    events: {
        'click .show-more': 'showDetails',
        'click .additional': 'showDetails'
    },

    initialize: function() {
    },

    render: function() {
        var attrs = [];

        for (var k in this.model.attributes) {
            if (k != 'id')
                attrs.push({ name: k, value: this.model.attributes[k] });
        }

        var additionalText = _.map(this.model.attributes, function(value, key) {
            return key + ': ' + value;
        }).slice(0,20).join('... ')

        this.$el.html( ich.documentTmpl({
            id: this.model.id,
            attributes: attrs,
            additional: additionalText + '...'
        }) );

        this.$('.show-more').tooltip({ placement: 'right' });

        return this;
    },

    showDetails: function() {
        if (this.areDetailsShown) {
            this.$('.additional').show();
            this.$('.more').hide();
            this.areDetailsShown = false;
        } else {
            this.$('.additional').hide();
            this.$('.more').show();
            this.areDetailsShown = true;
        }
    }
});

Document.Views.DocumentsView = Backbone.View.extend({
    tagName: 'div',

    subViews: {},

    initialize: function() {
        _.bindAll(this, 'render');
        this.collection.on('reset', this.render);
    },

    render: function() {
        var that = this;

        _.each(this.subViews, function(view, key) {
            view.remove();
        });
        this.subViews = {};
        this.$el.empty();

        if (this.collection.length) {
            this.collection.each(function(model) {
                that.subViews[model.id] = new Document.Views.DocumentView({
                    model: model
                }).render();
                that.subViews[model.id].$el.appendTo(that.el);
            });
        } else {
            this.$el.html('<p class="alert">Could not find documents matching your query</p>');
        }

        return this;
    }
});

})(DCC.module('document'));

