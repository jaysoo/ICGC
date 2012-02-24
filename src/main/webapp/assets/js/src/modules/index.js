(function(Index) {

//~ Models and Collections ========================================================================

Index.Models.Index = Backbone.Model.extend({
    idAttribute: 'type'
});

Index.Models.Indices = Backbone.Collection.extend({
    model: Index.Models.Index
});

//~ Views =========================================================================================

Index.Views.IndexView = Backbone.View.extend({
    initialize: function() {
    },

    render: function() {
        return this;
    }
});

Index.Views.IndicesView = Backbone.View.extend({

    

    initialize: function() {
    },

    render: function() {
        var that = this;

        this.collection.each(function() {

        });
        
        return this;
    }
});

})(DCC.module('index'));

