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
    events: {
      'change': 'onChange'
    },

    initialize: function() {
    },

    render: function() {
        var that = this;

        this.$el.append( ich.indexTmpl({
            "selected?": true,
            value: '',
            label: 'ALL'
        }) );

        this.collection.each(function(model) {
            that.$el.append( ich.indexTmpl({
                "selected?": false,
                value: model.get('type'),
                label: model.get('type')
            }) );
        });
        
        return this;
    },


    onChange: function(ev) {
        var $option = this.$(':selected'),
            type = $option.val(),
            model = this.collection.find(function(model) {
                return model.get('type') == type;
            });
        this.trigger('selected', model || null);
    }
});

})(DCC.module('index'));

