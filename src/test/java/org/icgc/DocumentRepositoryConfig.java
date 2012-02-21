package org.icgc;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DocumentRepositoryConfig {

    @Bean
    public DocumentRepository repo() {
        return new DocumentRepository();
    }
}
