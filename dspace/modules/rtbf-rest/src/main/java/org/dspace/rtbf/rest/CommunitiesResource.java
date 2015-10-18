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

/**
 * Root resource (exposed at "communities" path)
 * @author nln
 *
 */
@Path("/communities")
public class CommunitiesResource extends Resource {
    private static Logger log = Logger.getLogger(CommunitiesResource.class);
    
    public static final String FACETFIELD = "titlecom";
    public static final SimpleNode.Attribute ELEMENT = SimpleNode.Attribute.TITLE;

    @GET
    @Path("titles")
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public List<SimpleNode> getTitles2(
            @QueryParam("pt") @DefaultValue("") String partialTerms,
            @Context HttpHeaders headers, @Context HttpServletRequest request)
            throws WebApplicationException
    {
        log.info("Reading communities titles.(pt=" + partialTerms + ").");

        return(getSimpleNodes(FACETFIELD, ELEMENT, partialTerms, headers, request));
    }
    	
}
