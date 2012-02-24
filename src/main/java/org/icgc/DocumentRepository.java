package org.icgc;

import static com.google.common.base.Strings.isNullOrEmpty;
import static org.elasticsearch.index.query.QueryBuilders.matchAllQuery;
import static org.elasticsearch.index.query.QueryBuilders.queryString;
import javax.inject.Inject;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.action.search.SearchType;
import org.elasticsearch.client.Client;
import org.elasticsearch.client.action.search.SearchRequestBuilder;
import org.springframework.stereotype.Repository;

@Repository
public final class DocumentRepository {

    private static final String[] EMPTY_FIELDS = new String[] {};

    @Inject
    private Client client;

    /*
     * Performs a search using a JSON string. Will convert string to SearchRequest object.
     */
    public SearchResponse search(String json, String index, String type) {
        SearchRequest request = new SearchRequest(isNullOrEmpty(index)
                ? "_all" : index).source(json);

        if (!isNullOrEmpty(type))
            request.types(type);

        return client.search(request).actionGet();
    }

    public SearchResponse searchAll(int size, int from, String... indices) {
        return response(all(prepare(size, from, indices)));
    }

    public SearchResponse searchSources(String qs, int size, int from, String... indices) {
        return response(query(qs, prepare(size, from, indices)));
    }

    public SearchResponse searchFields(String[] fields, String qs, int size, int from, String... indices) {
        return response(fields(fields, query(qs, prepare(size, from, indices))));
    }

    public SearchResponse searchIds(String qs, int size, int from, String... indices) {
        return response(fields(EMPTY_FIELDS, query(qs, prepare(size, from, indices))));
    }

    // ~ Helper builder methods ==============================================================================
    private SearchRequestBuilder prepare(int size, int from, String... indices) {
        return client.prepareSearch(indices)
                .setSearchType(SearchType.DFS_QUERY_THEN_FETCH)
                .setFrom(from).setSize(size);
    }

    private SearchRequestBuilder all(SearchRequestBuilder builder) {
        return builder.setQuery(matchAllQuery());
    }

    private SearchRequestBuilder query(String qs, SearchRequestBuilder builder) {
        return builder.setQuery(queryString(qs));
    }

    private SearchRequestBuilder fields(String[] fields, SearchRequestBuilder builder) {
        return builder.addFields(fields);
    }

    private SearchResponse response(SearchRequestBuilder builder) {
        return builder.execute().actionGet();
    }

}
