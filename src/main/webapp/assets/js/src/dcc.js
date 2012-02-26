//~ DCC namespace and helper functions ============================================================
window.DCC = {
    /*
     * Memoized function for loading required modules.
     *
     * The first time a module is called via DCC.module(name), it will be empty. Any subsequent calls for that module will return the previous object.
     */
    module: _.memoize(function() {
        return { Views: {}, Models: {} };
    }),

    /*
     * Helper method for pulling out hits data from an elasticsearch response.
     */
    hits: function(response) {
        return _.map(response.hits.hits, function(hit) {
            return _.extend({}, hit._source, { id: hit._id });
        });
    },

    /*
     * Helper method for pulling out facets data from an elasticsearch response.
     */
    facets: function(response) {
        var facets = [];

        for (var k in response.facets) {
            facets.push( _.extend({
                id: k
            }, response.facets[k]) );
        }

        return facets;
    },

    /*
     * Mixins that can be used to extend a Backbone Model/View with reusable functions.
     *
     * Usage example:
     * var MyPaginationModel = Backbone.Model.extend({ ... });
     * _.extend(MyPaginationModel.prototype, DCC.Mixins.Pagination);
     */
    Mixins: {
        Pagination: {
            pages: function(active, end, size, pagesToDisplay) {
                var pages = [],
                    start = Math.max(active - pagesToDisplay / 2, 1);

                for (var i = start, count = 0; i <= end && count < pagesToDisplay; i++, count++) {
                    pages.push({
                        num: i,
                        active: i == active
                    });
                }

                return pages;
            }
        }
    }
};
