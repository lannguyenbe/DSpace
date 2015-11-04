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
@Path("/subjects")
public class SubjectsResource extends Resource {
    private static Logger log = Logger.getLogger(SubjectsResource.class);
    
    public static final String FACETFIELD = "subject";
    public static final SimpleNode.Attribute ELEMENT = SimpleNode.Attribute.SUBJECT;

    
    /**
     * Method handling HTTP GET requests. The returned object will be sent
     * to the client as "text/plain" media type.
     *
     * @return String that will be returned as a text/plain response.
     */
    @GET
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public List<SimpleNode> getNames(
            @QueryParam("pt") @DefaultValue("") String partialTerms,
            @Context HttpHeaders headers, @Context HttpServletRequest request)
    throws WebApplicationException
    {
        log.info("Reading subjects.(pt=" + partialTerms + ").");

        return(getSimpleNodes(FACETFIELD, ELEMENT, partialTerms, headers, request));
    }
    
}
