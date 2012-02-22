package org.icgc;

import static org.icgc.SearchUtils.toStringContent;
import java.security.Principal;
import java.util.Locale;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.View;
import org.springframework.web.servlet.ViewResolver;
import org.springframework.web.servlet.mvc.multiaction.NoSuchRequestHandlingMethodException;

@Controller
@RequestMapping("web")
public class PageController {

    @Inject
    private Environment env;

    @Inject
    private DocumentRepository repo;

    @Inject
    private ViewResolver viewResolver;

    @Inject
    @Qualifier("facets")
    private String facets;

    @Inject
    @Qualifier("query")
    private String query;

    public static final String MATCH_ALL = "{ \"match_all\": {} }";

    @RequestMapping(value = "/", method = RequestMethod.GET)
    public ModelAndView index(HttpServletRequest request, Locale locale, Principal principal)
            throws NoSuchRequestHandlingMethodException {
        String json = String.format(query, MATCH_ALL, facets);
        return page("index", request, locale, principal)
                .addObject("query", query)
                .addObject("queryFacets", facets)
                .addObject("documents", toStringContent(repo.search(json)));
    }

    @RequestMapping(value = "{page}", method = RequestMethod.GET)
    public ModelAndView page(@PathVariable String page, HttpServletRequest request, Locale locale, Principal principal)
            throws NoSuchRequestHandlingMethodException {
        ModelAndView mv = new ModelAndView();

        mv.addObject("ASSETS_URL", env.getProperty("assets.url")).addObject("SITE_URL", env.getProperty("site.url"))
                .addObject("SITE_NAME", env.getProperty("site.name")).setViewName(page);

        // Try to resolve the view here, if null or exception is thrown then return 404
        try {
            View view = viewResolver.resolveViewName(mv.getViewName(), locale);
            if (view != null)
                return mv;
        } catch (Exception e) {
            // nothing
        }

        throw new NoSuchRequestHandlingMethodException(request);
    }
}
