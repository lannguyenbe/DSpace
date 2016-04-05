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
import java.util.HashMap;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.Response;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.dspace.content.DSpaceObject;
import org.dspace.core.Constants;
import org.dspace.core.Context;
import org.dspace.discovery.DiscoverFacetField;
import org.dspace.discovery.DiscoverHitHighlightingField;
import org.dspace.discovery.DiscoverQuery;
import org.dspace.discovery.DiscoverResult;
import org.dspace.discovery.SearchService;
import org.dspace.discovery.DiscoverResult.FacetResult;
import org.dspace.discovery.SearchServiceException;
import org.dspace.discovery.configuration.DiscoveryConfigurationParameters;
import org.dspace.discovery.configuration.DiscoveryHitHighlightFieldConfiguration;
import org.dspace.handle.HandleManager;
import org.dspace.rtbf.rest.common.SimpleNode;
import org.dspace.rtbf.rest.util.RsConfigurationManager;
import org.dspace.rtbf.rest.util.RsDiscoveryConfiguration;
import org.dspace.sort.OrderFormat;
import org.dspace.utils.DSpace;

/**
 * Superclass of all resource classes in REST API. 
 * 
 */
public abstract class Resource
{

    private static Logger log = Logger.getLogger(Resource.class);
    
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
            // Remove diacritic
            facetVal = OrderFormat.makeSortString(facetVal, null, OrderFormat.TEXT);

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

	    DiscoverFacetField dff = new DiscoverFacetField("{!key="+facetField+"}"+facetField+"_keyword",
                DiscoveryConfigurationParameters.TYPE_STANDARD,
                org.dspace.rtbf.rest.common.Constants.LIMITMAX,
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
          processException("Could not process getSimpleNodes. Message:"+e.getMessage(), context);
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
                if (results.size() > org.dspace.rtbf.rest.common.Constants.DEFAULT_LOV_RPP)
                    break;
            }
            return results;
            
        }

        return (new ArrayList<SimpleNode>());
    }
    

    // actually get sequences results
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
    		if (sb.length() > 0) {
    			query.addFilterQueries("{!q.op=OR}" + "location:(" + sb.toString() + ")");
    		}
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
        
    	// Filter queries
    	String[] fqs = getFilterQueries(context, searchRequest);
    	for (String fq : fqs) {
    		query.addFilterQueries(fq);
    	}


        // Facetting and facet pagination
    	if (searchRequest.isFacet()) {
    		int facetLimit = searchRequest.getFacetLimit();
    		int facetOffset = searchRequest.getFacetOffset() * facetLimit;
    		
    		// Facet on <f>_keyword
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


    		// Facet on role_contributor_filter with facet prefixes
    		String[] rolePrefix = { "Journaliste", "Pr\u00e9sentateur", "Intervenant" };
    		for (String role : rolePrefix) {
    			// remove diacritic + lower case
    			String prefix = OrderFormat.makeSortString(role, null, OrderFormat.TEXT);
    			DiscoverFacetField dff = new DiscoverFacetField("{!key="+role+":contributor"+"_filter"+" facet.prefix="+prefix+"/}role_contributor"
		                , DiscoveryConfigurationParameters.TYPE_TEXT // TYPE_TEXT has effects : add _filter to role_contributor to process; remove _filter from key after processing
		                , /* facet limit  */ facetLimit
		                , /* facet sort   */ DiscoveryConfigurationParameters.SORT.COUNT
		                , /* facet offset */ facetOffset);
		        query.addFacetField(dff);
		        query.setFacetMinCount(1);
    		}
    		
    		// addDateIssuedFacet("date_issued", "dc.date.issued_dt", "dateIssued.year", query, context);
    		addDateIssuedFacet("date_issued", "date_issued_dt", "date_issued.year", query, context);
    		/* 10.03.2016 Lan : call to addDateIssuedFacet(String keyName, String dateFacet, String yearFacet, DiscoverQuery query, Context context)
    		 * where <keyName>_dt matched with <dateFacet> 
    		 * "date_issued" as <keyName> = indexFieldName in SearchFilter in discovery.xml, determines <keyName>_dt that is used as filtertype for searching
    		 * "date_issued_dt" as <dateFacet> = real solr field in date type; the mapping from <keyName>_dt to <facetName> is done in rtbf-rest.cfg, is optional in this case
    		 */
    		
    	}
    	
    	// Highlighting
    	if (searchRequest.isHighlight()) {
	    	for (DiscoveryHitHighlightFieldConfiguration fieldConfiguration : RsDiscoveryConfiguration.getHighlightFieldConfigurations())
	    	{
	    		// query.addHitHighlightingField(new DiscoverHitHighlightingField(fieldConfiguration.getField(), fieldConfiguration.getMaxSize(), fieldConfiguration.getSnippets()));
	    		query.addHitHighlightingField(new DiscoverHitHighlightingField(fieldConfiguration.getField()
	    				, (searchRequest.isSnippet()) ? fieldConfiguration.getMaxSize() : 0
	    				, fieldConfiguration.getSnippets()));
	    	}
    	}
    	
        // 2. Perform query
		return (getSearchService().search(context, query));
	}
	
	
	public String[] getFilterQueries(Context context, Request searchRequest) {
		
		List<String> allFilterQueries = new ArrayList<String>();
		
		for (Map<String, String> fq : searchRequest.getParameterFilterQueries()) {
            String filterType = fq.get("filtertype");
            String filterOperator = fq.get("filter_relational_operator");
            String filterValue = fq.get("filter");

            if(StringUtils.isNotBlank(filterValue)){
            	if (filterType.equals("*")) { return new String[0]; } // any filterType = not filter at all
                filterType = getSearchFilterName(filterType); // get searchFilter name from filterType front end name from rtbf-rest.cfg
                boolean isIndexed = RsDiscoveryConfiguration.getSearchFilters().containsKey(filterType); // verify if searchFilter is configured in discovery.xml
                try {
                	allFilterQueries.add(getSearchService().toFilterQuery(context
                			, (isIndexed || filterType.matches("'(.+)'")) ? filterType 
                					: "'"+filterType+"'" // within quote the filterType stayed unchanged, not suffix by _keyword or _partial
                			, filterOperator, filterValue).getFilterQuery());
                } catch (SQLException e) {
                	return new String[0];
                }
           }
		}

		return allFilterQueries.toArray(new String[allFilterQueries.size()]);
	}
	
	protected String getSearchFilterName(String key) {
		Properties mapper = (Properties) RsConfigurationManager.getInstance().getAttribute(org.dspace.rtbf.rest.common.Constants.FILTERMETA);
		if (mapper != null) {
	    	String label = mapper.getProperty(key);
	    	if (label != null) {
	    		return label;
	    	}
		}
    	return key;
	}


    // Date Math
    public static final String _DT = "_dt";
    public static final Map<String, String[]> _DTMATH = new HashMap<>();
    static {
    	_DTMATH.put("[ -1DAY ]"  , new String[] {"{!key=\"${keyName}_dt:[ -1DAY ]\"}",   "[ NOW/DAY-1DAY TO NOW/DAY+1DAY ]"});
    	// Lan 19.01.2015 : use inclusive range with -1MILLI because exclusive range with {} gives error "Invalid date String" (solrj bug ?)
    	//_DTMATH.put("[ -7DAYS ]" , new String[] {"{!key=\"date_issued_dt:[ -7DAYS ]\"}",  "[ NOW/DAY-7DAYS TO NOW/DAY-1DAY }"});
    	_DTMATH.put("[ -7DAYS ]" , new String[] {"{!key=\"${keyName}_dt:[ -7DAYS ]\"}",  "[ NOW/DAY-7DAYS TO NOW/DAY-1DAY-1MILLI ]"});
    	_DTMATH.put("[ -1MONTH ]", new String[] {"{!key=\"${keyName}_dt:[ -1MONTH ]\"}", "[ NOW/DAY-1MONTH TO NOW/DAY-7DAYS-1MILLI ]"});
    	_DTMATH.put("[ -1YEAR ]" , new String[] {"{!key=\"${keyName}_dt:[ -1YEAR ]\"}",  "[ NOW/DAY-1YEAR TO NOW/DAY-1MONTH-1MILLI ]"});
    	_DTMATH.put("[ +1YEAR ]" , new String[] {"{!key=\"${keyName}_dt:[ +1YEAR ]\"}",  "[ * TO NOW/DAY-1YEAR-1MILLI ]"});
    }

	/* 
	 * 10.03.2016 Lan :
	 * 1st param keyName : will fixed the names (<keyName>, <keyName>_dt) used as filtertype
	 * 2nd param dateFacet : name of the solr field in date type (not text type)
	 * 3rd param yearFacet : name of the solr field containing year only
	 */
	private void addDateIssuedFacet(String keyName, String dateFacet, String yearFacet, DiscoverQuery query, Context context) throws SearchServiceException {

		// Get results count from 12 last months
        DiscoverQuery yearRangeQuery = new DiscoverQuery();
        yearRangeQuery.setQuery(query.getQuery());
        yearRangeQuery.setDSpaceObjectFilter(query.getDSpaceObjectFilter());
        for (String f : query.getFilterQueries()) {
        	yearRangeQuery.addFilterQueries(f);
        }
        yearRangeQuery.setMaxResults(0);

		yearRangeQuery.addFilterQueries(dateFacet + ":[ NOW/DAY-1YEAR TO NOW ]");
        DiscoverResult last12MonthsResult = getSearchService().search(context, yearRangeQuery);
        if (last12MonthsResult.getTotalSearchResults() > 0) { // result found within 12 months
			for (Map.Entry<String, String[]> todayMath : _DTMATH.entrySet()) {
        		query.addFacetQuery(todayMath.getValue()[0].replaceFirst("\\$\\{keyName\\}", keyName)  + dateFacet + ":" + todayMath.getValue()[1]);					
			}        	
        } else { // no result found within 12 months
        	addDateFacet(keyName, dateFacet, yearFacet, query, context);       	
        }
	}

		
	private void addDateFacet(String keyName, String dateFacet, String yearFacet, DiscoverQuery query, Context context) throws SearchServiceException {
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
        	query.addFacetField(new DiscoverFacetField(
        			"{!key="+ keyName +"}"+ yearFacet
        			, DiscoveryConfigurationParameters.TYPE_STANDARD
            		, -1 // facet limit 
            		,  DiscoveryConfigurationParameters.SORT.VALUE)); // facet sort 
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
                facetQueries.add("{!key=\""+ keyName +":["+ bottomYear + " TO "+ currentTop +"]\"}"+ yearFacet +":["+ bottomYear +" TO "+ currentTop +"]");
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

        
    	// Filter queries
    	String[] fqs = getFilterQueries(context, searchRequest);
    	for (String fq : fqs) {
    		query.addFilterQueries(fq);
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

    	// Filter queries
    	String[] fqs = getFilterQueries(context, searchRequest);
    	StringBuilder filterQ = new StringBuilder();
    	for (int i = 0, len = fqs.length; i < len; i++ ) {
    		filterQ.append(" AND ");
    		filterQ.append(fqs[i]);
    	}
    	if (filterQ.length() > 0) {
            query.addProperty("filterQ", filterQ.substring(5));    		
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

    	// Filter queries
    	String[] fqs = getFilterQueries(context, searchRequest);
    	StringBuilder filterQ = new StringBuilder();
    	for (int i = 0, len = fqs.length; i < len; i++ ) {
    		filterQ.append(" AND ");
    		filterQ.append(fqs[i]);
    	}
    	if (filterQ.length() > 0) {
            query.addProperty("filterQ", filterQ.substring(5));    		
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




