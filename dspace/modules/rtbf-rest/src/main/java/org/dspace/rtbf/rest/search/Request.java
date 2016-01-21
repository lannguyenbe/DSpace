package org.dspace.rtbf.rest.search;

import javax.ws.rs.core.MultivaluedMap;

import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.TreeMap;

import org.apache.commons.lang.StringUtils;
import org.dspace.discovery.DiscoverQuery.SORT_ORDER;
import org.dspace.rtbf.rest.common.Constants;
import org.dspace.rtbf.rest.common.MetadataEntry;
import org.dspace.rtbf.rest.util.RsConfigurationManager;
import org.dspace.core.Context;
import org.mortbay.log.Log;

public class Request {
	private String scope;
	private String query;
	private int limit;
	private int offset;
	private String sortField;
	private SORT_ORDER sortOrder;
	private boolean facet = false;
	private int facetLimit = Constants.DEFAULT_FACET_RPP;
	private int facetOffset = Constants.DEFAULT_FACET_OFFSET;
	private boolean highlight = true;
	private boolean snippet = false;
	private List<Map<String, String>> parameterFilterQueries;
	


	public Request(MultivaluedMap<String, String> params, Context context) {
		String str;
		
		scope = params.getFirst("scope");
		query = params.getFirst("q");
		
		str = params.getFirst("limit");
		limit = Integer.parseInt((str == null ||  str.length() == 0) ? Constants.DEFAULT_LIMIT : str);
		if (limit < 0) { limit = Constants.DEFAULT_RPP; }
		
		str = params.getFirst("offset");
		offset = Integer.parseInt((str == null ||  str.length() == 0) ? "0" : str );
		if (offset < 0) { offset = 0; }

		str = params.getFirst("sort-by");
		if (str != null &&  str.length() > 0) {
			// retrieve solr sort field corresponding to the frontend field
			sortField = MetadataEntry.getSortLabel(str);
			if (sortField == null) { sortField = str; }
	        str = params.getFirst("order");        
	        try {
		        if (str != null && str.length() > 0) {
		        	sortOrder = SORT_ORDER.valueOf(str);
		        } else {
		        	sortOrder = Constants.DEFAULT_ORDER;
		        }
	        } catch (IllegalArgumentException e) {
		        	sortOrder = Constants.DEFAULT_ORDER;
	        }
		}
		
		str = params.getFirst("facet");
		if (str != null && str.length() > 0) {
			facet = Boolean.parseBoolean(str);
			if (facet) {
				String si = params.getFirst("facet.limit");
				if (si != null && si.length() > 0) { facetLimit = Integer.parseInt(si); }
				si = params.getFirst("facet.offset");
				if (si != null && si.length() > 0) { facetOffset = Integer.parseInt(params.getFirst("facet.offset")); }
			}
		}
		
		str = params.getFirst("highlight");
		if (str != null && str.length() > 0) {
			highlight = Boolean.parseBoolean(str);
		}

		str = params.getFirst("snippet");
		if (str != null && str.length() > 0) {
			snippet = Boolean.parseBoolean(str);
		}

		setParameterFilterQueries(params);
		
	}
	

	public List<Map<String,String>> getParameterFilterQueries() {
		return parameterFilterQueries;
	}

	public void setParameterFilterQueries(MultivaluedMap<String, String> params) {
		List<Map<String, String>> fqs = new ArrayList<Map<String, String>> ();
		
        List<String> filterTypes = getRepeatableParameters(params, "filtertype");
        List<String> filterOperators = getRepeatableParameters(params, "filter_relational_operator");
        List<String> filterValues = getRepeatableParameters(params, "filter");
        
        for (int i = 0, len = filterTypes.size(); i < len; i++) {
        	String filterType = filterTypes.get(i);
            String filterValue = filterValues.get(i);
            String filterOperator = filterOperators.get(i);

            Map<String, String> fq = new Hashtable<String, String>();
            fq.put("filtertype", new String(filterType));
            fq.put("filter_relational_operator", new String(filterOperator));
            fq.put("filter", new String(filterValue));
            
            fqs.add(i, fq);
            
        }	
		
        parameterFilterQueries = fqs;		
	}
	
	public List<String> getRepeatableParameters(MultivaluedMap<String, String> params, String prefix) {
        TreeMap<String, String> result = new TreeMap<String, String>();
         
        for (String key : params.keySet()) {
        	if (key.startsWith(prefix)) {
        		result.put(key, params.getFirst(key));
        	}
        }
        return new ArrayList<String>(result.values());		
	}


	public String getScope() {
		return scope;
	}


	public void setScope(String scope) {
		this.scope = scope;
	}


	public String getQuery() {
		return query;
	}


	public void setQuery(String query) {
		this.query = query;
	}


	public int getLimit() {
		return limit;
	}


	public void setLimit(int limit) {
		this.limit = limit;
	}


	public int getOffset() {
		return offset;
	}


	public void setOffset(int offset) {
		this.offset = offset;
	}


	public String getSortField() {
		return sortField;
	}


	public void setSortField(String sortField) {
		this.sortField = sortField;
	}


	public SORT_ORDER getSortOrder() {
		return sortOrder;
	}


	public void setSortOrder(SORT_ORDER sortOrder) {
		this.sortOrder = sortOrder;
	}


	public boolean isFacet() {
		return facet;
	}


	public void setFacet(boolean facet) {
		this.facet = facet;
	}


	public int getFacetLimit() {
		return facetLimit;
	}


	public void setFacetLimit(int facetLimit) {
		this.facetLimit = facetLimit;
	}


	public int getFacetOffset() {
		return facetOffset;
	}


	public void setFacetOffset(int facetOffset) {
		this.facetOffset = facetOffset;
	}


	public boolean isSnippet() {
		return snippet;
	}


	public void setSnippet(boolean snippet) {
		this.snippet = snippet;
	}


	public boolean isHighlight() {
		return highlight;
	}


	public void setHighlight(boolean highlight) {
		this.highlight = highlight;
	}

}
