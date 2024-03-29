package org.icgc.config;

import java.io.IOException;
import javax.inject.Inject;
import org.codehaus.jackson.map.ObjectMapper;
import org.icgc.EnvironmentInterceptor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.ComponentScan.Filter;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.ViewResolver;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;
import org.springframework.web.servlet.view.freemarker.FreeMarkerConfigurer;
import org.springframework.web.servlet.view.freemarker.FreeMarkerViewResolver;
import com.google.common.io.ByteStreams;

@Configuration
@EnableWebMvc
@ComponentScan(basePackages = "org.icgc", excludeFilters = { @Filter(Configuration.class) })
public class WebMvcConfig extends WebMvcConfigurerAdapter {

    private final ObjectMapper mapper = new ObjectMapper();

    @Inject
    private ConfigurableEnvironment env;

    // ~ Beans ===============================================================================================

    @Bean
    public EnvironmentInterceptor environmentInterceptor() {
        return new EnvironmentInterceptor(env);
    }

    @Bean
    public FreeMarkerConfigurer freeMarkerConfigurer() {
        FreeMarkerConfigurer configurer = new FreeMarkerConfigurer();
        configurer.setTemplateLoaderPath("/WEB-INF/templates/");
        return configurer;
    }

    @Bean
    @Qualifier("elasticsearch.query.size")
    public Integer size() {
        return 10;
    }

    @Bean
    public ViewResolver freeMarkerViewResolver() {
        FreeMarkerViewResolver viewResolver = new FreeMarkerViewResolver();

        viewResolver.setCache(false);
        viewResolver.setSuffix(".ftl");
        viewResolver.setExposeSpringMacroHelpers(true);
        viewResolver.setOrder(0);

        return viewResolver;
    }

    @Bean
    @Qualifier("elasticsearch.query.facets")
    public String facets() throws IOException {
        return resource("/facets.json");
    }

    @Bean
    @Qualifier("elasticsearch.indices")
    public String indices() throws IOException {
        return resource("/indices.json");
    }

    @Bean
    @Qualifier("elasticsearch.query.template")
    public String query() throws IOException {
        return resource("/query.json");
    }
    
    @Bean
    @Qualifier("elasticsearch.query.searchFields")
    public String searchFields() throws IOException {
        return resource("/searchFields.json");
    }

    @Bean
    public LocaleResolver localeResolver() {
        return new AcceptHeaderLocaleResolver();
    }

    // ~ Overrides ===========================================================================================

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(environmentInterceptor()).addPathPatterns("/web/*");
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("redirect:/web/");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/favicon.ico").addResourceLocations("/assets/favicon.ico");
        registry.addResourceHandler("/robot.txt").addResourceLocations("/assets/robot.txt");
        registry.addResourceHandler("/human.txt").addResourceLocations("/assets/human.txt");
        registry.addResourceHandler("/assets/**").addResourceLocations("/assets/");
    }

    private String resource(String location) throws IOException {
        return new String(ByteStreams.toByteArray(WebMvcConfig.class.getResourceAsStream(location)));
    }

}
