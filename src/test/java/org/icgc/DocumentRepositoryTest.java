package org.icgc;

import static org.junit.Assert.assertTrue;
import javax.inject.Inject;
import org.elasticsearch.action.search.SearchResponse;
import org.icgc.config.DevelopmentConfig;
import org.icgc.config.ElasticsearchConfig;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.support.AnnotationConfigContextLoader;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(loader = AnnotationConfigContextLoader.class, classes = { DevelopmentConfig.class,
        ElasticsearchConfig.class, DocumentRepositoryConfig.class })
@ActiveProfiles("development")
public class DocumentRepositoryTest {

    @Inject
    private DocumentRepository repo;

    @Test
    public void testSearchSources() {
        SearchResponse resp = repo.searchSources("AN_SSM_00004", 10, 0, "dcc");
        assertTrue(resp.getHits().getTotalHits() > 0);
    }

}
