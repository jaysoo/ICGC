(function(Document) {

//~ Models and Collections ========================================================================

Document.Models.Document = Backbone.Model.extend({
});

Document.Models.Documents = Backbone.Collection.extend({
    model: Document.Models.Document
});

//~ Views =========================================================================================

Document.Views.DocumentView = Backbone.View.extend({
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

Document.Views.DocumentsView = Backbone.View.extend({
    tagName: 'ul',

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

        this.collection.each(function(model) {
            that.subViews[model.id] = new Document.Views.DocumentView({
                model: model
            }).render();
            that.subViews[model.id].$el.appendTo(that.el);
        });
        return this;
    }
});

})(DCC.module('document'));

