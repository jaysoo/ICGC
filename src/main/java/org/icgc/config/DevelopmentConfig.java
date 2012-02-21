package org.icgc.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.context.annotation.PropertySource;

@Configuration
@Profile("development")
@PropertySource("classpath:/development.properties")
public class DevelopmentConfig {
}
