package org.icgc.config;

import java.io.IOException;
import java.io.InputStream;
import javax.inject.Inject;
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
        InputStream is = WebMvcConfig.class.getResourceAsStream("/facets.json");
        return new String(ByteStreams.toByteArray(is));
    }

    @Bean
    @Qualifier("elasticsearch.query.template")
    public String query() throws IOException {
        InputStream is = WebMvcConfig.class.getResourceAsStream("/query.json");
        return new String(ByteStreams.toByteArray(is));
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

}
