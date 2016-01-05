/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
package org.dspace.rtbf.rest.search;

import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.ListIterator;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.Response;

import org.apache.log4j.Logger;
import org.dspace.content.DSpaceObject;
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
        		"search.resourceid", "search.resourcetype", "dc.title", "rtbf.identifier.attributor" };
        for (String sf : searchFields) {
        	query.addSearchField(sf);			
		}
        
        // Facetting and facet pagination
    	if (searchRequest.isFacet()) {
    		int facetLimit = searchRequest.getFacetLimit();
    		int facetOffset = searchRequest.getFacetOffset() * facetLimit;
    		
            String[][] facetFields = { {"matter","subject_keyword"}, {"place","place_keyword"} };
    		for (String[] keyword : facetFields) {
    	        DiscoverFacetField dff = new DiscoverFacetField("{!key="+keyword[0]+"}"+keyword[1]
    	                , DiscoveryConfigurationParameters.TYPE_STANDARD
    	                , /* facet limit  */ facetLimit
    	                , /* facet sort   */ DiscoveryConfigurationParameters.SORT.COUNT
    	                , /* facet offset */ facetOffset);
    	        query.addFacetField(dff);
    	        query.setFacetMinCount(1);
    		}

	        String[] rolePrefix = { "Journaliste", "Pr\u00e9sentateur", "Intervenant" };
    		for (String role : rolePrefix) {
		        DiscoverFacetField dff = new DiscoverFacetField("{!key="+role+" facet.prefix="+role+"/}role_keyword"
		                , DiscoveryConfigurationParameters.TYPE_STANDARD
		                , /* facet limit  */ facetLimit
		                , /* facet sort   */ DiscoveryConfigurationParameters.SORT.COUNT
		                , /* facet offset */ facetOffset);
		        query.addFacetField(dff);
		        query.setFacetMinCount(1);
    		}
    		
    		addDateFacet("dc.date.issued_dt", "dateIssued.year", query, context);
    		
    	}

        // 2. Perform query
		return (getSearchService().search(context, query));
	}
	
	
	private void addDateFacet(String dateFacet, String yearFacet, DiscoverQuery query, Context context) throws SearchServiceException {
        int oldestYear = -1;
        int newestYear = -1;

        // Get the oldest year
        DiscoverQuery yearRangeQuery = new DiscoverQuery();
        yearRangeQuery.setQuery(query.getQuery());
        yearRangeQuery.setDSpaceObjectFilter(query.getDSpaceObjectFilter());
        for (String f : query.getFilterQueries()) {
        	yearRangeQuery.addFilterQueries(f);
        }
        yearRangeQuery.setMaxResults(1);
        //Set our query to anything that has this value
        yearRangeQuery.addFieldPresentQueries(yearFacet);
        //Set sorting so our last value will appear on top
        yearRangeQuery.setSortField(yearFacet+"_sort", DiscoverQuery.SORT_ORDER.asc);
        yearRangeQuery.addSearchField(yearFacet);
        DiscoverResult lastYearResult = getSearchService().search(context, yearRangeQuery);
        
        if(0 < lastYearResult.getDspaceObjects().size()){
            java.util.List<DiscoverResult.SearchDocument> searchDocuments = lastYearResult.getSearchDocument(lastYearResult.getDspaceObjects().get(0));
            if(0 < searchDocuments.size() && 0 < searchDocuments.get(0).getSearchFieldValues(yearFacet).size()){
                oldestYear = Integer.parseInt(searchDocuments.get(0).getSearchFieldValues(yearFacet).get(0));
            }
        }
        
        //Now get the newest year
        yearRangeQuery.setSortField(yearFacet+"_sort", DiscoverQuery.SORT_ORDER.desc);
        DiscoverResult firstYearResult = getSearchService().search(context, yearRangeQuery);
        if( 0 < firstYearResult.getDspaceObjects().size()){
            java.util.List<DiscoverResult.SearchDocument> searchDocuments = firstYearResult.getSearchDocument(firstYearResult.getDspaceObjects().get(0));
            if(0 < searchDocuments.size() && 0 < searchDocuments.get(0).getSearchFieldValues(yearFacet).size()){
                newestYear = Integer.parseInt(searchDocuments.get(0).getSearchFieldValues(yearFacet).get(0));
            }
        }
        
        //No values found!
        if(newestYear == -1 || oldestYear == -1) { return; }
        
        int gap = 1;
        //Attempt to retrieve our gap using the algorithm below
        int yearDifference = newestYear - oldestYear;
        if(yearDifference != 0){
            while (10 < ((double)yearDifference / gap)){
                gap *= 10;
            }
        }
        // We need to determine our top year so we can start our count from a clean year
        // Example: 2001 and a gap from 10 we need the following result: 2010 - 2000 ; 2000 - 1990 hence the top year
        int topYear = (int) (Math.ceil((float) (newestYear)/gap)*gap);

        if(gap == 1){
            //We need a list of our years
            //We have a date range add faceting for our field
            //The faceting will automatically be limited to the 10 years in our span due to our filterquery
        	
        	Date today = Calendar.getInstance().getTime();
        	SimpleDateFormat formatter = new SimpleDateFormat("yyyy");
        	int todayYear = Integer.parseInt(formatter.format(today));
        	
        	if ((todayYear - topYear) > 1) {
                query.addFacetField(new DiscoverFacetField(yearFacet, DiscoveryConfigurationParameters.TYPE_STANDARD
                		, /* facet limit */ -1
                		, /* facet sort  */ DiscoveryConfigurationParameters.SORT.VALUE));
        	} else {
        		query.addFacetQuery("{!key=\"date_issued:[ -1DAY ]\"}"   + dateFacet + ":[ NOW/DAY-1DAY TO NOW/DAY+1DAY ]");
        		query.addFacetQuery("{!key=\"date_issued:[ -7DAYS ]\"}"  + dateFacet + ":[ NOW/DAY-7DAYS TO NOW/DAY-1DAY }");
        		query.addFacetQuery("{!key=\"date_issued:[ -1MONTH ]\"}" + dateFacet + ":[ NOW/DAY-1MONTH TO NOW/DAY-7DAYS }");
        		query.addFacetQuery("{!key=\"date_issued:[ -1YEAR ]\"}"  + dateFacet + ":[ NOW/DAY-1YEAR TO NOW/DAY-1MONTH }");
        		query.addFacetQuery("{!key=\"date_issued:[ +1YEAR ]\"}"  + dateFacet + ":[ * TO NOW/DAY-1YEAR }");
        	}
            // facetQueries.add
        } else {
            java.util.List<String> facetQueries = new ArrayList<String>();
            //Create facet queries but limit them to 11 (11 == when we need to show a "show more" url)
            for(int year = topYear; year > oldestYear && (facetQueries.size() < 11); year-=gap){
                //Add a filter to remove the last year only if we aren't the last year
                int bottomYear = year - gap;
                //Make sure we don't go below our last year found
                if(bottomYear < oldestYear)
                {
                    bottomYear = oldestYear;
                }

                //Also make sure we don't go above our newest year
                int currentTop = year;
                if((year == topYear))
                {
                    currentTop = newestYear;
                }
                else
                {
                    //We need to do -1 on this one to get a better result
                    currentTop--;
                }
//                facetQueries.add(yearFacet + ":[" + bottomYear + " TO " + currentTop + "]");
                facetQueries.add("{!key=\"date_issued:["+ bottomYear + " TO " + currentTop + "]\"}"  + yearFacet + ":[" + bottomYear + " TO " + currentTop + "]");
            }
            for (String facetQuery : facetQueries) {
                query.addFacetQuery(facetQuery);
            }
        }
        
	}
	

	/*
	 * The results of the query are about sequences, use facet to access the collections of those results
	 */
	protected DiscoverResult getCollectionResultFromFacet(int resourceType, Context context, Request searchRequest) throws SearchServiceException {

        // 1. Prepare the query
        DiscoverQuery query = new DiscoverQuery();

        // Use request handler /selectNoCollapse instead of the default /select
        // to be compatible with the method getCollectionResultAsJoin() that uses the request handle /selectCollection which is also NO collapsing
        query.addProperty("qt", "/selectNoCollapse");
        
        // Prepare facetting and facet pagination : use facet to get the parent collections of the results
        DiscoverFacetField dff = new DiscoverFacetField("location.coll"
                , DiscoveryConfigurationParameters.TYPE_STANDARD
                , searchRequest.getLimit() /* facet limit */
                , DiscoveryConfigurationParameters.SORT.COUNT
                , searchRequest.getOffset() * searchRequest.getLimit() /* facet offset */);
        query.addFacetField(dff);
        query.setFacetMinCount(1);
        query.setMaxResults(0); // count of results only
                
        // q terms
        query.setQuery(searchRequest.getQuery());

        // return which resourcetype document (community/collection/item) - should be item
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
    				processException("Could not process getCollectionResultFromFacet. Message:"+e.getMessage(), context);
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

        
        // 2. Perform query
        DiscoverResult queryResults = getSearchService().search(context, query);
        
        // 3. Make facet results as main results 
        if (queryResults != null) {
            List<FacetResult> facets = queryResults.getFacetResult("location.coll");
            int facetIndex = 0;
            
            for (FacetResult facet : facets) {
                DSpaceObject o = null;
				try {
					o = DSpaceObject.find(context, (Integer) org.dspace.core.Constants.COLLECTION, (Integer) Integer.parseInt(facet.getAsFilterQuery()));
				} catch (NumberFormatException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (SQLException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				queryResults.addDSpaceObject(o);
				facetIndex++;
            }
            
            // setTotalSearchResults to count of collections
            if (searchRequest.getOffset() == 0 && facetIndex < searchRequest.getLimit()) {
            	// set count of collections to facet count
                queryResults.setTotalSearchResults(facetIndex);
            } else { 
            	// do another search to get count of collections
            	DiscoverResult collections = getCollectionResultAsJoin(org.dspace.core.Constants.COLLECTION, context, searchRequest);
            	searchRequest.setLimit(0); // Do not get results detail only their count
            	queryResults.setTotalSearchResults(collections.getTotalSearchResults());
            }
        }

        return queryResults;

	}

	
	protected DiscoverResult getCollectionResultAsJoin(int resourceType, Context context, Request searchRequest) throws SearchServiceException {
		// 1. Prepare the query
        DiscoverQuery query = new DiscoverQuery();
        
        // use request handler /selectCollection instead of the default /select
        query.addProperty("qt", "/selectCollection");
        
        // seqQuery terms instead of q terms
        // query.setQuery(searchRequest.getQuery());
        query.addProperty("seqQ", searchRequest.getQuery());

        // return which resourcetype document (community/collection/item) - should be collection
        query.setDSpaceObjectFilter(resourceType);
    	
        /*
         *  TODO test ALL the following features
         */

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
    				processException("Could not process getCollectionResultAsJoin. Message:"+e.getMessage(), context);
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

    		// b. Add filter query at SEQUENCE level, e.g with {!join ...
    		// query.addFilterQueries("{!q.op=OR}" + "location:(" + sb.toString() + ")");  // fq at parent level
    		query.addFilterQueries("{!join from=location.collection to=search.uniqueid}(_query_:\"{!q.op=OR v=$locQ}\")" ); // fq at sequence level
            query.addProperty("locQ", "location:(" + sb.toString() + ")");
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

	
	protected DiscoverResult getSerieResultAsJoin(int resourceType, Context context, Request searchRequest) throws SearchServiceException {
		// 1. Prepare the query
        DiscoverQuery query = new DiscoverQuery();
        
        // use request handler /selectCommunity instead of the default /select
        query.addProperty("qt", "/selectCommunity");
        
        // seqQuery terms instead of q terms
        // query.setQuery(searchRequest.getQuery());
        query.addProperty("seqQ", searchRequest.getQuery());

        // return which resourcetype document (community/collection/item) - should be community
        query.setDSpaceObjectFilter(resourceType);
    	
        /*
         *  TODO test ALL the following features
         */

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
    				processException("Could not process getSerieResultAsJoin. Message:"+e.getMessage(), context);
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

    		// b. Add filter query at SEQUENCE level, e.g with {!join ...
    		query.addFilterQueries("{!join from=location.community to=search.uniqueid}(_query_:\"{!q.op=OR v=$locQ}\")" ); // fq at sequence level
            query.addProperty("locQ", "location:(" + sb.toString() + ")");
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




