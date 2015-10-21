package org.dspace.rtbf.rest.search;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

import org.dspace.discovery.DiscoverResult;
import org.dspace.rtbf.rest.common.DSpaceObject;

@XmlRootElement(name = "searchResponse")
public class SearchResponse {
	
	private Long numFound = 0L;

    private SearchResponseParts.ResponseHeader responseHeader;
    private List<DSpaceObject> results;
    private SearchResponseParts.FacetsCount facets;
	private SearchResponseParts.Expanded expanded;
	private SearchResponseParts.Highlighting highlighting;
	
    @XmlElement(required = true)
    private List<String> expand = new ArrayList<String>();
	
	public SearchResponse () {}
	
	public SearchResponse (DiscoverResult queryResults, String expand) {
		this();
		
		disableExpand();
		
		if (queryResults != null) {
			numFound = queryResults.getTotalSearchResults();			
		}
				
        List<String> expandFields = new ArrayList<String>();
		if (expand != null) {
			expandFields = Arrays.asList(expand.split(","));
		}

        if(expandFields.contains("responseHeader") || expandFields.contains("all")) {
        	setResponseHeader(new SearchResponseParts.ResponseHeader());
        } else {
            this.addExpand("responseHeader");
        }

        if(expandFields.contains("facets") || expandFields.contains("all")) {
        	setFacets(new SearchResponseParts.FacetsCount());
        } else {
            this.addExpand("facets");
        }
        
        if(expandFields.contains("expanded") || expandFields.contains("all")) {
        	setExpanded(new SearchResponseParts.Expanded());
        } else {
            this.addExpand("expanded");
        }

        if(expandFields.contains("highlighting") || expandFields.contains("all")) {
        	setHighlighting(new SearchResponseParts.Highlighting());
        } else {
            this.addExpand("highlighting");
        }

	}
		
	public void addExpand(String expandableAttribute) {
    	if (this.expand != null) {
    		this.expand.add(expandableAttribute);
    	}
    }

    public void enableExpand() {
    	if (this.expand == null) {
    		expand = new ArrayList<String>();
    	}
    }

    public void disableExpand() {
    	this.expand = null;    	
    }
	
    public List<String> getExpand() {
        return expand;
    }

    public Long getNumFound() {
		return numFound;
	}

	public void setNumFound(Long numFound) {
		this.numFound = numFound;
	}

	public SearchResponseParts.ResponseHeader getResponseHeader() {
		return responseHeader;
	}

	public void setResponseHeader(SearchResponseParts.ResponseHeader responseHeader) {
		this.responseHeader = responseHeader;
	}

	public List<DSpaceObject> getResults() {
		return results;
	}

	public void setResults(List<DSpaceObject> list) {
		this.results = list;
	}

	public SearchResponseParts.FacetsCount getFacets() {
		return facets;
	}

	public void setFacets(SearchResponseParts.FacetsCount facets) {
		this.facets = facets;
	}

	public SearchResponseParts.Expanded getExpanded() {
		return expanded;
	}

	public void setExpanded(SearchResponseParts.Expanded expanded) {
		this.expanded = expanded;
	}

	public SearchResponseParts.Highlighting getHighlighting() {
		return highlighting;
	}

	public void setHighlighting(SearchResponseParts.Highlighting highlighting) {
		this.highlighting = highlighting;
	}

}
