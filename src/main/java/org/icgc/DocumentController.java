package org.icgc;

import static com.google.common.base.Strings.isNullOrEmpty;
import java.io.IOException;
import javax.inject.Inject;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.common.xcontent.ToXContent;
import org.elasticsearch.common.xcontent.XContentBuilder;
import org.elasticsearch.common.xcontent.XContentFactory;
import org.elasticsearch.common.xcontent.XContentType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("api/search")
public class DocumentController {

    public static final String DELIMITER = ",";
    public static final String DEFAULT_SIZE = "20";

    @Inject
    private DocumentRepository repo;

    @RequestMapping(method = RequestMethod.GET, produces = "application/json")
    @ResponseBody
    public String search(@RequestParam(value = "q", defaultValue = "") String q,
            @RequestParam(value = "size", defaultValue = DEFAULT_SIZE) int size,
            @RequestParam(value = "from", defaultValue = "0") int from,
            @RequestParam(value = "indices", defaultValue = "") String indices,
            @RequestParam(value = "source", defaultValue = "") String source) {

        if (!isNullOrEmpty(source))
            return toStringContent(repo.search(source));

        if (isNullOrEmpty(q))
            return toStringContent(repo.searchAll(size, from, indices.split(DELIMITER)));

        return toStringContent(repo.searchSources(q, size, from, indices.split(DELIMITER)));
    }

    private String toStringContent(SearchResponse response) {
        try {
            XContentBuilder builder = XContentFactory.contentBuilder(XContentType.JSON);
            builder.startObject();
            response.toXContent(builder, ToXContent.EMPTY_PARAMS);
            builder.endObject();
            return builder.string();
        } catch (IOException e) {
            throw new IllegalStateException("cannot convert response to JSON");
        }
    }
}
