package org.icgc;

import javax.inject.Inject;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping("web")
public class PageController {

    @Inject
    private Environment env;

    @RequestMapping(value = "/", method = RequestMethod.GET)
    public ModelAndView index() {
        return page("index");
    }

    @RequestMapping(value = "{page}", method = RequestMethod.GET)
    public ModelAndView page(@PathVariable String page) {
        ModelAndView mv = new ModelAndView();

        mv.addObject("ASSETS_URL", env.getProperty("assets.url")).addObject("SITE_URL", env.getProperty("site.url"))
                .addObject("SITE_NAME", env.getProperty("site.name")).setViewName(page);

        return mv;
    }
}
