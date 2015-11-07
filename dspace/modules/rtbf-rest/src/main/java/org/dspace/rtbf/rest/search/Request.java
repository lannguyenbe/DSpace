package org.dspace.rtbf.rest.search;

import javax.ws.rs.core.MultivaluedMap;

import java.util.Properties;

import org.dspace.discovery.DiscoverQuery.SORT_ORDER;
import org.dspace.rtbf.rest.common.Constants;
import org.dspace.rtbf.rest.util.RsConfigurationManager;
import org.dspace.core.Context;

public class Request {
	private String scope;
	private String query;
	private int limit;
	private int offset;
	private String sortField;
	private SORT_ORDER sortOrder;


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
			sortField = ((Properties) RsConfigurationManager.getInstance().getAttribute(Constants.SORTMETA)).getProperty(str);
			if (sortField == null) { sortField = str; }
	        str = params.getFirst("order");        
	        try {
		        if (str != null && str.length() > 0) {
		        	sortOrder = SORT_ORDER.valueOf(str);
		        } else {
		        	sortOrder = Constants.ORDER_DEFAULT;
		        }
	        } catch (IllegalArgumentException e) {
		        	sortOrder = Constants.ORDER_DEFAULT;
	        }
		}
		
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

}
