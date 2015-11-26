/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
package org.dspace.rtbf.rest.search;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.ListIterator;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.Response;

import org.apache.log4j.Logger;
import org.dspace.core.Constants;
import org.dspace.core.Context;
import org.dspace.discovery.DiscoverFacetField;
import org.dspace.discovery.DiscoverQuery;
import org.dspace.discovery.DiscoverResult;
import org.dspace.discovery.SearchService;
import org.dspace.discovery.DiscoverResult.FacetResult;
import org.dspace.discovery.SearchServiceException;
import org.dspace.discovery.configuration.DiscoveryConfigurationParameters;
import org.dspace.handle.HandleManager;
import org.dspace.rtbf.rest.common.SimpleNode;
import org.dspace.sort.OrderFormat;
import org.dspace.utils.DSpace;

/**
 * Superclass of all resource classes in REST API. 
 * 
 */
public abstract class Resource
{

    private static Logger log = Logger.getLogger(Resource.class);
    
    private static final int FACETLIMIT = 100;
    
    /**
     * Process exception, print message to logger error stream and abort DSpace
     * context.
     * 
     * @param message
     *            Message, which will be printed to error stream.
     * @param context
     *            Context which must be aborted.
     * @throws WebApplicationException
     *             This exception is throw for user of REST api.
     */
    protected static void processException(String message, org.dspace.core.Context context) throws WebApplicationException
    {
        if ((context != null) && (context.isValid()))
        {
            context.abort();
        }
        log.error(message);
        throw new WebApplicationException(Response.Status.INTERNAL_SERVER_ERROR);
    }

    /**
     * Process finally statement. It will print message to logger error stream
     * and abort DSpace context, if was not properly ended.
     *
     * @param context
     *            Context which must be aborted.
     * @throws WebApplicationException
     *             This exception is throw for user of REST api.
     */
    protected void processFinally(org.dspace.core.Context context) throws WebApplicationException
    {
    	if ((context != null) && (context.isValid()))
        {
            context.abort();
            log.error("Something get wrong. Aborting context in finally statement.");
            throw new WebApplicationException(Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    
    protected SearchService getSearchService()
    {
        DSpace dspace = new DSpace();
        
        org.dspace.kernel.ServiceManager manager = dspace.getServiceManager() ;

        return manager.getServiceByName(SearchService.class.getName(),SearchService.class);
    }
    

    protected void filterFacetResults(List<FacetResult> facets, String qterms) {
    
        // Match pattern that begins a word
        String search = qterms.replaceAll("(\\p{Alnum}+)", "\\\\b$1");
        log.debug("Regex filter facet results.(search=" + search + ").");

        // Compile individual patterns
        String[] tokens = search.split("\\s+");
        List<Pattern> patterns = new ArrayList<Pattern>();
        for (String token : tokens) {
            log.debug("token=" + token);
            patterns.add(Pattern.compile(token, Pattern.CASE_INSENSITIVE));
        }

        // Filter the facet results : ok if match with all patterns
        for (ListIterator<FacetResult> it = facets.listIterator(); it.hasNext();) {
            String facetVal = it.next().getSortValue();
            for(Pattern pattern : patterns){
                if (!pattern.matcher(facetVal).find()) {
                    it.remove();
                    break;
                }
            }
        }

    }
    

    public List<SimpleNode> getSimpleNodes(
            String facetField, SimpleNode.Attribute name,
            String pTerms,
            HttpHeaders headers, HttpServletRequest request)
            throws WebApplicationException
    {

        ArrayList<SimpleNode> results = null;
        org.dspace.core.Context context = null;
        DiscoverResult queryResults = null;
                
        DiscoverQuery query = new DiscoverQuery();

        DiscoverFacetField dff = new DiscoverFacetField(facetField,
                DiscoveryConfigurationParameters.TYPE_AC, -1,
                DiscoveryConfigurationParameters.SORT.VALUE);
        query.addFacetField(dff);
        query.setFacetMinCount(1);
        query.setMaxResults(0);
               
        String qterms = null;
        String partialTerms = pTerms.trim();
        if (partialTerms != null && !partialTerms.isEmpty()) {
            // Remove diacritic + escape all but alphanum
            qterms = OrderFormat.makeSortString(partialTerms, null, OrderFormat.TEXT)
                        .replaceAll("([^\\p{Alnum}\\s])", "\\\\$1");
            query.addFilterQueries("{!q.op=AND}" + facetField + "_partial:(" + qterms + ")");

            log.debug("Solr filter query terms.(qterms=" + qterms + ").");
        }
        
        try {
           context = new org.dspace.core.Context();

           queryResults = getSearchService().search(context, query);

           context.complete();
        } catch (Exception e) {
          processException("Could not process authors. Message:"+e.getMessage(), context);
        } finally {
          processFinally(context);            
        }
        
        if (queryResults != null) {
            List<FacetResult> facets = queryResults.getFacetResult(facetField);
            
            // Filter results is mandatory when facet.field is multivalue
            if (qterms != null && !qterms.isEmpty()) {
                filterFacetResults(facets, qterms);
            }

            results = new ArrayList<SimpleNode>();          
            for (FacetResult facet : facets) {
                results.add(new SimpleNode().setAttribute(name, facet.getDisplayedValue()));
                if (results.size() > FACETLIMIT)
                    break;
            }
            return results;
            
        }

        return (new ArrayList<SimpleNode>());
    }
    

	protected DiscoverResult getQueryResult(int resourceType, Context context, Request searchRequest) throws SearchServiceException {
		// 1. Prepare the query
        DiscoverQuery query = new DiscoverQuery();

        // q terms
        query.setQuery(searchRequest.getQuery());

        // return which resourcetype document (community/collection/item)
        query.setDSpaceObjectFilter(resourceType);
    	
        // limit the search within community/collection
        String scope = searchRequest.getScope();
    	if (scope != null) { // scope contains logical expression of handles
    		// a. Replace handle by m{community_id} or l{collection_id}
    		StringBuffer sb = new StringBuffer();    		
    		Pattern pattern = Pattern.compile("\\d+/\\d+");
    		Matcher matcher = pattern.matcher(scope);

    		while (matcher.find()) {
    			String handle = matcher.group();
    			String replacement;

    			org.dspace.content.DSpaceObject dso = null;
    			try {
    				dso = HandleManager.resolveToObject(context, handle);
    			} catch (Exception e) {
    				processException("Could not process getQueryResults. Message:"+e.getMessage(), context);
    			};

    			if(dso == null) {
    				replacement = handle;
    			} else {
    				switch (dso.getType()) {
    				case Constants.COMMUNITY:
    					replacement = "m" + dso.getID();
    					break;
    				case Constants.COLLECTION:
    					replacement = "l" + dso.getID();
    					break;
    				default :
    					replacement = handle;
    				}
    			}
    			matcher.appendReplacement(sb, replacement);
    		}

    		// b. Add filter query
    		query.addFilterQueries("{!q.op=OR}" + "location:(" + sb.toString() + ")");
    	}


    	// Pagination
    	query.setMaxResults(searchRequest.getLimit());
        if (searchRequest.getOffset() > 0) {
            query.setStart(searchRequest.getOffset());
        }
        
        // Order
        if (searchRequest.getSortField() != null) {
        	query.setSortField(searchRequest.getSortField(), searchRequest.getSortOrder());
        }
        
        // Search Fields : handle is included by default
        String[] searchFields = {
                // Those are needed in expanded items
        		"search.resourceid", "search.resourcetype", "dc.title", "rtbf.identifier.attributor"
        };
        for (String sf : searchFields) {
        	query.addSearchField(sf);			
		}
        
        // 2. Perform query
		return (getSearchService().search(context, query));
	}

}


