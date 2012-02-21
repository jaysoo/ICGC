package org.icgc;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

public class EnvironmentInterceptor extends HandlerInterceptorAdapter {

    private final ConfigurableEnvironment env;

    @Inject
    public EnvironmentInterceptor(ConfigurableEnvironment env) {
        this.env = env;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView mv)
            throws Exception {

        mv.addObject("ASSETS_URL", env.getProperty("assets.url")).addObject("SITE_URL", env.getProperty("site.url"))
                .addObject("SITE_NAME", env.getProperty("site.name"));
    }
}
