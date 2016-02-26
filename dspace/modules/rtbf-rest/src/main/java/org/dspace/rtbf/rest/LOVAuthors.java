package org.dspace.rtbf.rest;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;

import org.apache.log4j.Logger;
import org.dspace.rtbf.rest.common.SimpleNode;
import org.dspace.rtbf.rest.search.Resource;

/**
 * Root resource (exposed at "authors" path)
 */
@Path("/")
public class LOVAuthors extends Resource {
    private static Logger log = Logger.getLogger(LOVAuthors.class);
    
    public static final String FACETFIELD = "author";
    public static final SimpleNode.Attribute ELEMENT = SimpleNode.Attribute.NAME;

    
    @GET
    @Path("{alternatePaths: authors|contributors/names}")
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public List<SimpleNode> getNames(
            @QueryParam("pt") @DefaultValue("") String partialTerms,
            @Context HttpHeaders headers, @Context HttpServletRequest request)
    throws WebApplicationException
    {
        log.info("Reading contributor name.(pt=" + partialTerms + ").");

        return(getSimpleNodes(FACETFIELD, ELEMENT, partialTerms, headers, request));
    }
    
    @GET
    @Path("{alternatePaths: roles|contributors/roles}")
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public List<SimpleNode> getRoles(
            @QueryParam("pt") @DefaultValue("") String partialTerms,
            @Context HttpHeaders headers, @Context HttpServletRequest request)
    throws WebApplicationException
    {
    	partialTerms = ""; // results are always the same list
        log.info("Reading contributor roles.(pt=" + partialTerms + ").");

        return(getSimpleNodes("role", SimpleNode.Attribute.KEY, partialTerms, headers, request));
    }
    
}
