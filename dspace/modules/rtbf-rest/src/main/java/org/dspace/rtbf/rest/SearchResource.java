package org.dspace.rtbf.rest;

import org.apache.log4j.Logger;
import org.dspace.discovery.DiscoverResult;
import org.dspace.rtbf.rest.common.Constants;
import org.dspace.rtbf.rest.search.EpisodesSearchResponse;
import org.dspace.rtbf.rest.search.Request;
import org.dspace.rtbf.rest.search.Resource;
import org.dspace.rtbf.rest.search.SearchResponse;
import org.dspace.rtbf.rest.search.SequencesSearchResponse;
import org.dspace.rtbf.rest.search.SeriesSearchResponse;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.UriInfo;

@Path("/search")
public class SearchResource extends Resource {
	
	private static final Logger log = Logger.getLogger(SearchResource.class);
	
    @GET
    @Path("sequences")
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public SearchResponse getItemsSearchResponse(
    		@QueryParam("scope") String scope
    		, @QueryParam("q") String qterms
    		, @QueryParam("limit") @DefaultValue(Constants.DEFAULT_LIMIT) Integer limit, @QueryParam("offset") @DefaultValue("0") Integer offset
    		, @QueryParam("sort-by") String orderBy, @QueryParam("order") String order
    		, @QueryParam("facet") @DefaultValue("false") Boolean isFacet 
    		, @QueryParam("facet.limit") Integer facetLimit, @QueryParam("facet.offset") Integer facetOffset
    		, @QueryParam("expand") String expand
    		, @Context UriInfo info
    		, @QueryParam("userIP") String user_ip, @QueryParam("userAgent") String user_agent, @QueryParam("xforwardedfor") String xforwardedfor
            , @Context HttpHeaders headers, @Context HttpServletRequest request) throws WebApplicationException
    {
        org.dspace.core.Context context = null;
        log.info("Searching sequences(q=" + qterms + ").");
        SearchResponse response = null;
        DiscoverResult queryResults = null;

        try {        	
            context = new org.dspace.core.Context();
            context.getDBConnection();
            
            Request searchRequest = new Request(info.getQueryParameters(), context);
            
            // expand the results if there is a query
            if (qterms != null && qterms.length() > 0) {
            	expand += ",results";
            	if (isFacet) { expand += ",facets"; }
            }
            queryResults = getQueryResult(org.dspace.core.Constants.ITEM, context, searchRequest);
            response = new SequencesSearchResponse(queryResults, expand, context, limit, offset);

            context.complete();

        } catch (Exception e) {
           processException("Could not process search sequences. Message:"+e.getMessage(), context);
        } finally {
           processFinally(context);            
        }

        return response;

    }
		
    @GET
    @Path("episodes")
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public SearchResponse getCollectionsSearchResponse(
    		@QueryParam("scope") String scope
    		, @QueryParam("q") String qterms
    		, @QueryParam("limit") @DefaultValue(Constants.DEFAULT_LIMIT) Integer limit, @QueryParam("offset") @DefaultValue("0") Integer offset
    		, @QueryParam("sort-by") String orderBy, @QueryParam("order") String order
    		, @QueryParam("expand") String expand
    		, @Context UriInfo info
    		, @QueryParam("userIP") String user_ip, @QueryParam("userAgent") String user_agent, @QueryParam("xforwardedfor") String xforwardedfor
            , @Context HttpHeaders headers, @Context HttpServletRequest request) throws WebApplicationException
    {
        org.dspace.core.Context context = null;
        log.info("Searching episodes(q=" + qterms + ").");
        SearchResponse response = null;
        DiscoverResult queryResults = null;

        try {
            context = new org.dspace.core.Context();
            context.getDBConnection();
            
            Request searchRequest = new Request(info.getQueryParameters(), context);
            
            // expand the results if there is a query
            if (qterms != null && qterms.length() > 0) { expand += ",results"; }
            
            if (orderBy != null && orderBy.length() > 0) {
	            queryResults = getCollectionResultAsJoin(org.dspace.core.Constants.COLLECTION, context, searchRequest);
	            response = new EpisodesSearchResponse(queryResults, expand, context, limit, offset);
            } else { /* default order is count of sequences that matched the query */
	            queryResults = getCollectionResultFromFacet(org.dspace.core.Constants.ITEM, context, searchRequest);
	            response = new EpisodesSearchResponse(queryResults, expand, context, limit, offset);
            }

            context.complete();

        } catch (Exception e) {
           processException("Could not process search episodes. Message:"+e.getMessage(), context);
         } finally {
           processFinally(context);            
         }

        return response;

    }

    @GET
    @Path("series")
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public SearchResponse getSeriesSearchResponse(
    		@QueryParam("scope") String scope
    		, @QueryParam("q") String qterms
    		, @QueryParam("limit") @DefaultValue(Constants.DEFAULT_LIMIT) Integer limit, @QueryParam("offset") @DefaultValue("0") Integer offset
    		, @QueryParam("sort-by") String orderBy, @QueryParam("order") String order
    		, @QueryParam("expand") String expand
    		, @Context UriInfo info
    		, @QueryParam("userIP") String user_ip, @QueryParam("userAgent") String user_agent, @QueryParam("xforwardedfor") String xforwardedfor
            , @Context HttpHeaders headers, @Context HttpServletRequest request) throws WebApplicationException
    {
        org.dspace.core.Context context = null;
        log.info("Searching series(q=" + qterms + ").");
        SearchResponse response = null;
        DiscoverResult queryResults = null;

        try {
            context = new org.dspace.core.Context();
            context.getDBConnection();
            
            Request searchRequest = new Request(info.getQueryParameters(), context);
            
            // expand the results if there is a query
            if (qterms != null && qterms.length() > 0) { expand += ",results"; }
            
	        queryResults = getSerieResultAsJoin(org.dspace.core.Constants.COMMUNITY, context, searchRequest);
	        response = new SeriesSearchResponse(queryResults, expand, context, limit, offset);

            context.complete();

        } catch (Exception e) {
           processException("Could not process search series. Message:"+e.getMessage(), context);
         } finally {
           processFinally(context);            
         }

        return response;

    }
    

}
