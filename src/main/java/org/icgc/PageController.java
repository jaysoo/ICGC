package org.icgc;

import static org.icgc.SearchUtils.toStringContent;
import java.security.Principal;
import java.util.Locale;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Qualifier;
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
    private DocumentRepository repo;

    @Inject
    private ViewResolver viewResolver;

    @Inject
    @Qualifier("elasticsearch.indices")
    private String indices;

    @Inject
    @Qualifier("elasticsearch.query.facets")
    private String facets;
    
    @Inject
    @Qualifier("elasticsearch.query.searchFields")
    private String searchFields;

    @Inject
    @Qualifier("elasticsearch.query.template")
    private String queryTemplate;

    @Inject
    @Qualifier("elasticsearch.query.size")
    private Integer size;

    public static final String MATCH_ALL = "{ \"match_all\": {} }";

    /*
     * Overview controller with project stats.
     */
    @RequestMapping(value = "/", method = RequestMethod.GET)
    public ModelAndView overview(HttpServletRequest request, Locale locale, Principal principal)
            throws NoSuchRequestHandlingMethodException {
        String json = String.format("{ \"query\": %s, \"fields\": [] }", MATCH_ALL);
        return page("index", request, locale, principal)
                .addObject("geneTotal", repo.search(json, "dcc", "gene").getHits().getTotalHits())
                .addObject("ssmTotal", repo.search(json, "dcc", "ssm").getHits().getTotalHits())
                .addObject("donorTotal", repo.search(json, "dcc", "donor").getHits().getTotalHits());
    }

    /*
     * Overview controller with project stats.
     */
    @RequestMapping(value = "search", method = RequestMethod.GET)
    public ModelAndView search(HttpServletRequest request, Locale locale, Principal principal)
            throws NoSuchRequestHandlingMethodException {
        String json = String.format(queryTemplate, size, MATCH_ALL, facets);
        return page("search", request, locale, principal)
                .addObject("indices", indices)
                .addObject("queryTemplate", queryTemplate)
                .addObject("querySize", size)
                .addObject("queryFacets", facets)
                .addObject("searchFields", searchFields)
                .addObject("documents", toStringContent(repo.search(json, null, null)));
    }

    /*
     * Generic method for return a page that maps to a Freemarker template name.
     */
    @RequestMapping(value = "{page}", method = RequestMethod.GET)
    public ModelAndView page(@PathVariable String page, HttpServletRequest request, Locale locale, Principal principal)
            throws NoSuchRequestHandlingMethodException {

        ModelAndView mv = new ModelAndView();
        mv.addObject("currPage", page).setViewName(page);

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
