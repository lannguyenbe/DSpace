package org.dspace.rtbf.rest.application;

import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.ext.ContextResolver;
import javax.ws.rs.ext.Provider;

import org.eclipse.persistence.jaxb.JAXBContextProperties;
import org.glassfish.jersey.moxy.json.MoxyJsonConfig;

@Provider
public class RsMoxyJsonContextResolver implements ContextResolver<MoxyJsonConfig> {

	private MoxyJsonConfig config;
    
    public RsMoxyJsonContextResolver() {
        final Map<String, String> namespacePrefixMapper = new HashMap<String, String>();
        namespacePrefixMapper.put("http://www.w3.org/2001/XMLSchema-instance", "xsi");
        
        config = new MoxyJsonConfig()
            .setNamespacePrefixMapper(namespacePrefixMapper)
            .setNamespaceSeparator(':')
            .property(JAXBContextProperties.JSON_WRAPPER_AS_ARRAY_NAME, true) // because of XmlElementWrapper
//            .setFormattedOutput(true)
//            .setIncludeRoot(true)
//            .setMarshalEmptyCollections(true)
            ;
        
    }
 
    @Override
    public MoxyJsonConfig getContext(Class<?> objectType) {
        return config;
    }
}
