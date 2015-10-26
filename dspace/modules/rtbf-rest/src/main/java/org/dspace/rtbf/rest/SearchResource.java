package org.dspace.rtbf.rest;

import java.sql.SQLException;

import org.apache.log4j.Logger;
import org.dspace.discovery.DiscoverResult;
import org.dspace.rtbf.rest.search.SearchResponse;
import org.dspace.rtbf.rest.search.SequencesSearchResponse;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;

@Path("/search")
public class SearchResource extends Resource {
	
	private static final Logger log = Logger.getLogger(SearchResource.class);
	
    @GET
    @Path("sequences")
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public SearchResponse getSearchResponse(
    		@QueryParam("scope") String scope,
    		@QueryParam("q") String qterms,
    		@QueryParam("expand") @DefaultValue("results") String expand, @QueryParam("limit") @DefaultValue("100") Integer limit,
            @QueryParam("offset") @DefaultValue("0") Integer offset, @QueryParam("userIP") String user_ip,
            @QueryParam("userAgent") String user_agent, @QueryParam("xforwardedfor") String xforwardedfor,
            @Context HttpHeaders headers, @Context HttpServletRequest request) throws WebApplicationException
    {

        log.info("Searching sequences(q=" + qterms + ").");
        org.dspace.core.Context context = null;
        SearchResponse response = null;
        DiscoverResult queryResults = null;
        try {
            context = new org.dspace.core.Context();
            context.getDBConnection().setAutoCommit(true);

            queryResults = getQueryResults(org.dspace.core.Constants.ITEM, scope, qterms, expand, context, limit, offset);
            
            response = new SequencesSearchResponse(queryResults, expand, context, limit, offset);

            context.complete();

        } catch (Exception e) {
           processException("Could not process search sequences. Message:"+e.getMessage(), context);
         } finally {
           processFinally(context);            
         }

        return response;

    }

	
	

}
