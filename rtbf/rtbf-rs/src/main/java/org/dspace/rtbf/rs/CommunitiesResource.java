package org.dspace.rtbf.rs;

import java.util.ArrayList;
import java.util.List;
import java.util.ListIterator;
import java.util.regex.Pattern;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;

import org.apache.log4j.Logger;
import org.dspace.discovery.DiscoverFacetField;
import org.dspace.discovery.DiscoverQuery;
import org.dspace.discovery.DiscoverResult;
import org.dspace.discovery.SearchService;
import org.dspace.discovery.DiscoverResult.FacetResult;
import org.dspace.discovery.configuration.DiscoveryConfigurationParameters;
import org.dspace.rtbf.rs.common.Title;
import org.dspace.utils.DSpace;

/**
 * Root resource (exposed at "communitiestitle" path)
 * @author nln
 *
 */
@Path("/communities")
public class CommunitiesResource {
    private static Logger log = Logger.getLogger(CommunitiesResource.class);
    
    
//	@GET
//	@Produces({ MediaType.TEXT_PLAIN })
//	@Produces({ MediaType.APPLICATION_JSON })
//  @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })

    @GET
	@Path("titles")
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public Title[] getTitles_4(@Context HttpHeaders headers) {
		ArrayList<Title> results = null;
		org.dspace.core.Context context = null;
	    DiscoverResult queryResults = null;

	    String facetField = "titlecom";
	    String selectValues = "belge";
	    
		DiscoverQuery query = new DiscoverQuery();

        DiscoverFacetField dff = new DiscoverFacetField(facetField,
                DiscoveryConfigurationParameters.TYPE_AC, -1,
                DiscoveryConfigurationParameters.SORT.VALUE);
        query.addFacetField(dff);
        query.setFacetMinCount(1);
        query.setMaxResults(0);

        if (selectValues != null) {
            query.addFilterQueries("{!q.op=AND df="+facetField + "_partial}" + selectValues);
		}
		
		try {
//			context = createContext(getUser(headers));
           context = new org.dspace.core.Context();

           queryResults = getSearchService().search(context, query);

           context.complete();
		} catch (Exception e) {
//			processException("Could not process communitiestitle. Message:"+e.getMessage(), context);
			if (context != null && context.isValid())
				context.abort();
		} finally {
//			processFinally(context);			
			if (context != null && context.isValid())
				context.abort();
		}
		
		if (queryResults != null) {
			List<FacetResult> facets = queryResults.getFacetResult(facetField);
			if (selectValues != null) {
				// Compile the patterns from search value
				String search = selectValues.replaceAll("[^\\p{ASCII}]",".").replaceAll("(\\S+)", ".*$1.*");
		        String[] tokens = search.split("\\s+");
		        List<Pattern> patterns = new ArrayList<Pattern>();
		        for (String token : tokens) {
		        	patterns.add(Pattern.compile(token, Pattern.CASE_INSENSITIVE));
				}
				
				// filter the facet results
				for (ListIterator<FacetResult> it = facets.listIterator(); it.hasNext();) {
					String facetVal = it.next().getSortValue().replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
			        for(Pattern pattern : patterns){
			        	if (!pattern.matcher(facetVal).matches()) {
			        		it.remove();
			        		break;
			        	}
			        }
				}
			}

			results = new ArrayList<Title>();			
			for (FacetResult facet : facets) {
				results.add(new Title(facet.getDisplayedValue()));
			}
	        return results.toArray(new Title[0]);
			
		}

        return (new Title[] {new Title("in getTitles 500")});
	}


    public String[] getTitles_3(@Context HttpHeaders headers) {
		ArrayList<String> results = null;
		org.dspace.core.Context context = null;
	    DiscoverResult queryResults = null;

	    String facetField = "titlecom";
	    String selectValues = "belge";
	    
		DiscoverQuery query = new DiscoverQuery();

        DiscoverFacetField dff = new DiscoverFacetField(facetField,
                DiscoveryConfigurationParameters.TYPE_AC, -1,
                DiscoveryConfigurationParameters.SORT.VALUE);
        query.addFacetField(dff);
        query.setFacetMinCount(1);
        query.setMaxResults(0);

        if (selectValues != null) {
            query.addFilterQueries("{!q.op=AND df="+facetField + "_partial}" + selectValues);
		}
		
		try {
//			context = createContext(getUser(headers));
           context = new org.dspace.core.Context();

           queryResults = getSearchService().search(context, query);

           context.complete();
		} catch (Exception e) {
//			processException("Could not process communitiestitle. Message:"+e.getMessage(), context);
			if (context != null && context.isValid())
				context.abort();
		} finally {
//			processFinally(context);			
			if (context != null && context.isValid())
				context.abort();
		}
		
		if (queryResults != null) {
			List<FacetResult> facets = queryResults.getFacetResult(facetField);
			if (selectValues != null) {
				// Compile the patterns from search value
				String search = selectValues.replaceAll("[^\\p{ASCII}]",".").replaceAll("(\\S+)", ".*$1.*");
		        String[] tokens = search.split("\\s+");
		        List<Pattern> patterns = new ArrayList<Pattern>();
		        for (String token : tokens) {
		        	patterns.add(Pattern.compile(token, Pattern.CASE_INSENSITIVE));
				}
				
				// filter the facet results
				for (ListIterator<FacetResult> it = facets.listIterator(); it.hasNext();) {
					String facetVal = it.next().getSortValue().replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
			        for(Pattern pattern : patterns){
			        	if (!pattern.matcher(facetVal).matches()) {
			        		it.remove();
			        		break;
			        	}
			        }
				}
			}

			results = new ArrayList<String>();			
			for (FacetResult facet : facets) {
				results.add(facet.getDisplayedValue());
			}
	        return results.toArray(new String[0]);
//			return results.toString();
			
		}

        return (new String[] {"in getTitles 500"});
//		return "in getTitles 600";
	}
	

	public String getTitles_2(@Context HttpHeaders headers) {
		org.dspace.core.Context context = null;
	    DiscoverResult queryResults = null;
	    String facetField = "titlecom";
	    String selectValues = "belge";
	    
		DiscoverQuery query = new DiscoverQuery();
		
        DiscoverFacetField dff = new DiscoverFacetField(facetField,
                DiscoveryConfigurationParameters.TYPE_TEXT, -1,
                DiscoveryConfigurationParameters.SORT.VALUE);
        query.addFacetField(dff);
        query.setFacetMinCount(1);
        query.setMaxResults(0);
        
        if (selectValues != null) {
             query.addFilterQueries("{!q.op=AND df="+facetField + "_partial}" + selectValues);
		}
		
		try {
//			context = createContext(getUser(headers));
            context = new org.dspace.core.Context();
			
			queryResults = getSearchService().search(context, query);
			
            context.complete();
		} catch (Exception e) {
//			processException("Could not process communitiestitle. Message:"+e.getMessage(), context);
			if (context != null && context.isValid())
				context.abort();
		} finally {
//			processFinally(context);			
			if (context != null && context.isValid())
				context.abort();
		}
		
		if (queryResults != null) {
			if (selectValues != null) {
				// Compile the patterns from search value
				String search = selectValues.replaceAll("[^\\p{ASCII}]",".").replaceAll("(\\S+)", ".*$1.*");
		        String[] tokens = search.split("\\s+");
		        List<Pattern> patterns = new ArrayList<Pattern>();
		        for (String token : tokens) {
		        	patterns.add(Pattern.compile(token, Pattern.CASE_INSENSITIVE));
				}
				
				// filter the facet results
				List<FacetResult> facet = queryResults.getFacetResult(facetField);
				for (ListIterator<FacetResult> it = facet.listIterator(); it.hasNext();) {
					String facetVal = it.next().getSortValue().replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
			        for(Pattern pattern : patterns){
			        	if (!pattern.matcher(facetVal).matches()) {
			        		it.remove();
			        		break;
			        	}
			        }
				}
			}
			
			
			List<FacetResult> facet = queryResults.getFacetResult(facetField);
			return(facet.toString());
			
		}
		
		return "in getTitles_2";
	}

	
    protected SearchService getSearchService()
    {
        DSpace dspace = new DSpace();
        
        org.dspace.kernel.ServiceManager manager = dspace.getServiceManager() ;

        return manager.getServiceByName(SearchService.class.getName(),SearchService.class);
    }
	
}
