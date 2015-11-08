package org.dspace.rtbf.rest.application;

import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.ext.ContextResolver;
import javax.ws.rs.ext.Provider;

import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

@Provider
public class RsJacksonContextResolver implements ContextResolver<ObjectMapper> {

	final ObjectMapper defaultObjectMapper;
	
    public RsJacksonContextResolver() {
        defaultObjectMapper = new ObjectMapper()
    		.setSerializationInclusion(Include.NON_NULL)
        	.enable(MapperFeature.SORT_PROPERTIES_ALPHABETICALLY)
        	.enable(SerializationFeature.INDENT_OUTPUT)
        	.registerModule(new com.fasterxml.jackson.datatype.jsr353.JSR353Module())
        	.registerModule(new org.dspace.rtbf.rest.util.jackson.NameMappingModule())
        ;
    }
		
	@Override
	public ObjectMapper getContext(Class<?> type) {
		return defaultObjectMapper;
	}

}
