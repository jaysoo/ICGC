package org.icgc;

import static org.elasticsearch.index.query.QueryBuilders.queryString;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import javax.inject.Inject;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.action.search.SearchType;
import org.elasticsearch.client.Client;
import org.elasticsearch.client.action.search.SearchRequestBuilder;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.SearchHitField;
import org.springframework.stereotype.Repository;

@Repository
public final class DocumentRepository {

    private static final String[] EMPTY_FIELDS = new String[] {};

    @Inject
    private Client client;

    public List<Map<String, Object>> searchSources(String qs, int size, int from, String... indices) {

        List<Map<String, Object>> sources = new ArrayList<Map<String, Object>>();

        SearchResponse response = response(query(qs, prepare(size, from, indices)));

        for (SearchHit hit : response.getHits())
            sources.add(hit.getSource());

        return sources;
    }

    public List<Map<String, Object>> searchFields(String[] fields, String qs, int size, int from, String... indices) {

        List<Map<String, Object>> documents = new ArrayList<Map<String, Object>>();

        SearchResponse response = response(fields(fields, query(qs, prepare(size, from, indices))));

        for (SearchHit hit : response.getHits()) {
            Map<String, Object> map = new LinkedHashMap<String, Object>();
            for (Entry<String, SearchHitField> entry : hit.getFields().entrySet()) {
                map.put(entry.getValue().name(), entry.getValue().value());
            }
        }

        return documents;
    }

    public List<String> searchIds(String qs, int size, int from, String... indices) {

        List<String> sources = new ArrayList<String>();

        // Perform a field search with no fields, which will not return fields nor sources
        SearchResponse response = response(fields(EMPTY_FIELDS, query(qs, prepare(size, from, indices))));

        for (SearchHit hit : response.getHits())
            sources.add(hit.getId());

        return sources;
    }

    // ~ Helper builder methods ==============================================================================
    private SearchRequestBuilder prepare(int size, int from, String... indices) {
        return client.prepareSearch(indices)
                .setSearchType(SearchType.DFS_QUERY_THEN_FETCH)
                .setFrom(from).setSize(size);
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
