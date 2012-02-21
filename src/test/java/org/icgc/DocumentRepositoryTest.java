package org.icgc;

import static org.junit.Assert.assertTrue;
import java.util.List;
import java.util.Map;
import javax.inject.Inject;
import org.icgc.config.DevelopmentConfig;
import org.icgc.config.ElasticsearchConfig;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = "org.icgc", classes = { DevelopmentConfig.class, ElasticsearchConfig.class })
@ActiveProfiles("development")
public class DocumentRepositoryTest {

    @Inject
    private DocumentRepository repo;

    @Test
    public void testSearchSources() {
        List<Map<String, Object>> sources = repo.searchSources("AN_SSM_00004", 10, 0, "ssm");
        assertTrue(!sources.isEmpty());
    }

}
