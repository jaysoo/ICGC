package org.icgc;

import java.util.List;
import java.util.Map;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.elasticsearch.node.Node;
import org.elasticsearch.node.NodeBuilder;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.FactoryBean;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.core.io.Resource;

/**
 * Original: https://raw.github.com/erezmazor/projectx/master/org.projectx.elasticsearch/src/main/java/org/projectx/
 * elasticsearch/ElasticsearchNodeFactoryBean.java
 */
public class ElasticsearchNodeFactoryBean implements FactoryBean<Node>, InitializingBean,
        DisposableBean {

    protected final Log logger = LogFactory.getLog(getClass());

    private List<Resource> configLocations;

    private Resource configLocation;

    private Map<String, String> settings;

    private Node node;

    public void setConfigLocation(final Resource configLocation) {
        this.configLocation = configLocation;
    }

    public void setConfigLocations(final List<Resource> configLocations) {
        this.configLocations = configLocations;
    }

    public void setSettings(final Map<String, String> settings) {
        this.settings = settings;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        internalCreateNode();
    }

    private void internalCreateNode() {
        final NodeBuilder nodeBuilder = NodeBuilder.nodeBuilder();

        if (null != configLocation) {
            internalLoadSettings(nodeBuilder, configLocation);
        }

        if (null != configLocations) {
            for (final Resource location : configLocations) {
                internalLoadSettings(nodeBuilder, location);
            }
        }

        if (null != settings) {
            nodeBuilder.getSettings().put(settings);
        }

        node = nodeBuilder.node();
    }

    private void internalLoadSettings(final NodeBuilder nodeBuilder, final Resource configLocation) {

        try {
            final String filename = configLocation.getFilename();
            if (logger.isInfoEnabled()) {
                logger.info("Loading configuration file from: " + filename);
            }
            nodeBuilder.getSettings().loadFromStream(filename, configLocation.getInputStream());
        } catch (final Exception e) {
            throw new IllegalArgumentException("Could not load settings from configLocation: "
                    + configLocation.getDescription(), e);
        }
    }

    @Override
    public void destroy() throws Exception {
        try {
            node.close();
        } catch (final Exception e) {
            logger.error("Error closing Elasticsearch node: ", e);
        }
    }

    @Override
    public Node getObject() throws Exception {
        return node;
    }

    @Override
    public Class<Node> getObjectType() {
        return Node.class;
    }

    @Override
    public boolean isSingleton() {
        return true;
    }

}
