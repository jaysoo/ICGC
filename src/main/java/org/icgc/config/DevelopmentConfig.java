package org.icgc.config;

import javax.inject.Inject;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import com.google.common.collect.Lists;

@Configuration
@Profile("development")
@PropertySource("classpath:/development.properties")
public class DevelopmentConfig {

    @Inject
    private ConfigurableEnvironment env;

    /*
     * Generated a dummy admin user for development purposes.
     */
    @Bean
    public UserDetailsService userDetailsService() {
        GrantedAuthority authority = new SimpleGrantedAuthority("admin");
        String username = env.getProperty("admin.username", "admin");
        String password = env.getProperty("admin.password", "password");
        UserDetails user = new User(username, password, true, true, true, true, Lists.newArrayList(authority));
        InMemoryUserDetailsManager manager = new InMemoryUserDetailsManager(Lists.newArrayList(user));
        return manager;
    }
}
