package org.icgc.config;

import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.inject.Inject;
import org.elasticsearch.client.Client;
import org.icgc.ElasticsearchNodeFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

@Configuration
public class ElasticsearchConfig {

    @Bean
    public ElasticsearchNodeFactoryBean searchNode() {
        ElasticsearchNodeFactoryBean searchNode = new ElasticsearchNodeFactoryBean();
        searchNode.setSettings(settings());

        List<Resource> locations = new ArrayList<Resource>();

        final String[] urls = env.getRequiredProperty("elasticsearch.connections", String[].class);
        for (String url : urls) {
            try {
                locations.add(new UrlResource(new URL(url)));
            } catch (Exception e) {
                throw new IllegalArgumentException("Bad connection URL for elasticsearch: " + url);
            }
        }

        searchNode.setConfigLocations(locations);

        return searchNode;
    }

    @Bean
    public Client searchClient() throws Exception {
        return searchNode().getObject().client();
    }

    @Inject
    private ConfigurableEnvironment env;

    @Bean
    public Map<String, String> settings() {
        Map<String, String> settings = new HashMap<String, String>();

        settings.put("cluster.name", env.getRequiredProperty("elasticsearch.cluster.name"));

        return settings;
    }

}
