package org.icgc.config;

import javax.annotation.PreDestroy;
import javax.inject.Inject;
import org.elasticsearch.client.Client;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.ImmutableSettings;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.InetSocketTransportAddress;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.env.ConfigurableEnvironment;

@Configuration
public class ElasticsearchConfig {

    @Inject
    private ConfigurableEnvironment env;

    @Bean
    @Lazy
    public Settings settings() {
        ImmutableSettings.Builder builder = ImmutableSettings.settingsBuilder();
        builder.put("cluster.name", env.getRequiredProperty("elasticsearch.cluster.name"));
        return builder.build();
    }

    @Bean
    @Lazy
    public Client client() {
        final String[] urls = env.getRequiredProperty("elasticsearch.connections", String[].class);

        final TransportClient client = new TransportClient(settings());

        for (String url : urls) {
            try {
                String[] parts = url.split(":");
                String host = parts[0];
                int port = Integer.parseInt(parts[1]);
                client.addTransportAddress(new InetSocketTransportAddress(host, port));
            } catch (Exception e) {
                throw new IllegalArgumentException("Bad connection URL for elasticsearch: " + url);
            }
        }

        return client;
    }

    @PreDestroy
    public void closeElasticSearchClient() {
        client().close();
    }
}
