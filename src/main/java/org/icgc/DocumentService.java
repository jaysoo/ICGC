package org.icgc;

import javax.inject.Inject;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Service
@RequestMapping("api/search")
public class DocumentService {

    @Inject
    private DocumentRepository repo;

    @RequestMapping(method = RequestMethod.GET, produces = "application/json")
    @ResponseBody
    public String findAll() {
        throw new UnsupportedOperationException("Not yet implemented");
    }
}
