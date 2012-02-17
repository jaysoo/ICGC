package org.icgc;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/api/search")
public class DocumentController {
    @RequestMapping(method = RequestMethod.GET, produces = "application/json")
    @ResponseBody
    public String findAll() {
        throw new UnsupportedOperationException("Not yet implemented");
    }
}
