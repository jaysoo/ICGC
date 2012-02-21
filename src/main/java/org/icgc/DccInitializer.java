package org.icgc;

import javax.servlet.ServletContext;
import javax.servlet.ServletRegistration;
import org.icgc.config.DevelopmentConfig;
import org.icgc.config.ElasticsearchConfig;
import org.icgc.config.ProductionConfig;
import org.icgc.config.WebMvcConfig;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;

public class DccInitializer implements WebApplicationInitializer {

    @Override
    public void onStartup(ServletContext servletContext) {
        // Create the dispatcher servlet's Spring application context
        AnnotationConfigWebApplicationContext dispatcherContext = new AnnotationConfigWebApplicationContext();

        ConfigurableEnvironment env = dispatcherContext.getEnvironment();

        // Production and development environments will load with different properties
        if ("development".equals(System.getProperty("icgc.mode", "production")))
            env.setActiveProfiles("production");
        else
            env.setActiveProfiles("development");

        dispatcherContext.register(ProductionConfig.class, DevelopmentConfig.class, ElasticsearchConfig.class,
                WebMvcConfig.class);

        // Register and map the servlet dispatcher
        ServletRegistration.Dynamic dispatcher = servletContext.addServlet("dispatcher", new DispatcherServlet(
                dispatcherContext));
        dispatcher.setLoadOnStartup(1);
        dispatcher.addMapping("/");
    }

}
