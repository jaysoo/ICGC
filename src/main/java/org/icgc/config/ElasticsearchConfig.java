package org.icgc.config;

import java.util.HashMap;
import java.util.Map;

import javax.inject.Inject;

import org.elasticsearch.client.Client;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.ImmutableSettings;
import org.elasticsearch.common.transport.InetSocketTransportAddress;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.ConfigurableEnvironment;

import com.google.common.base.Splitter;

@Configuration
public class ElasticsearchConfig {

  @Inject
  private ConfigurableEnvironment env;

  @Bean
  public Client searchClient() throws Exception {
    Iterable<String> hosts = Splitter.on(",").split(env.getRequiredProperty("elasticsearch.connections"));
    TransportClient tc = new TransportClient(ImmutableSettings.settingsBuilder().put(settings()));
    for(String host : hosts) {
      if(host.contains(":")) {
        String[] hostAndPort = host.split(":");
        if(hostAndPort.length != 2) throw new IllegalArgumentException("invalid host:port '"+host+"'");
        tc.addTransportAddress(new InetSocketTransportAddress(hostAndPort[0], Integer.parseInt(hostAndPort[1])));
      } else {
        tc.addTransportAddress(new InetSocketTransportAddress(host, 9300));
      }
    }
    return tc;
  }

  private Map<String, String> settings() {
    Map<String, String> settings = new HashMap<String, String>();

    settings.put("cluster.name", env.getRequiredProperty("elasticsearch.cluster.name"));

    return settings;
  }

}
