package org.dspace.rtbf.rest.search;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import javax.ws.rs.WebApplicationException;
import javax.xml.bind.annotation.XmlTransient;

import org.apache.log4j.Logger;
import org.dspace.content.Item;
import org.dspace.core.ConfigurationManager;
import org.dspace.core.Context;
import org.dspace.discovery.DiscoverExpandedItems;
import org.dspace.discovery.DiscoverResult;
import org.dspace.discovery.DiscoverResult.SearchDocument;
import org.dspace.rtbf.rest.common.Constants;
import org.dspace.rtbf.rest.common.MetadataEntry;
import org.dspace.rtbf.rest.common.MetadataWrapper;
import org.dspace.rtbf.rest.common.RTBObject;
import org.dspace.rtbf.rest.common.Sequence;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;

public class SearchResponseParts {
    private static Logger log = Logger.getLogger(SearchResponseParts.class);
	
	public static class ResponseHeader {

	}

	public static class Result {
		
	    private List<org.dspace.rtbf.rest.common.RTBObject> lst;
	    
 		public Result(DiscoverResult queryResults, Context context) {
			int resultType = 0;
					
			if (queryResults != null && queryResults.getDspaceObjects().size() > 0) {
				
				lst = new ArrayList<org.dspace.rtbf.rest.common.RTBObject>();
				List<org.dspace.content.DSpaceObject> dsoList = queryResults.getDspaceObjects();
				
				if (! dsoList.isEmpty()) {
					resultType = dsoList.get(0).getType();
				}
				
	            for (org.dspace.content.DSpaceObject result : dsoList) {
					try {
						switch (resultType) {
						case Constants.ITEM:
		                    Sequence sequence = new Sequence(Constants.SEARCH_RESULT_VIEW, (Item) result, Constants.SEARCH_SEQUENCE_EXPAND_OPTIONS, null);
//		                    DiscoverResult.DSpaceObjectHighlightResult highlightedResults = queryResults.getHighlightedResults(result);

		                    // Add linked Documents 
		                    // the linked documents to this dso were already retrieved by the same search - in the expanded section ot solr response - 
		                    // only their handle are available
		                    List<RTBObject> linkedDocuments = new ArrayList<RTBObject>();	                    
		                    List<DiscoverResult.SearchDocument> entries = queryResults.getExpandDocuments(result);
		            		for (SearchDocument entry : entries) {
		            			linkedDocuments.add(new RTBObject(new DiscoverExpandedItems.ExpandedItem(entry)));
		            		}
		            		if (linkedDocuments.size() > 0) {
		            			sequence.setLinkedDocuments(linkedDocuments);
		            		}

							lst.add(sequence);
						case Constants.COLLECTION:
//							lst.add(new Episode(Constants.SEARCH_RESULT_VIEW, (Collection) result, null, null));
						case Constants.COMMUNITY:
//							lst.add(new Serie(Constants.SEARCH_RESULT_VIEW, (Community) result, null, null));
						}
					} catch (WebApplicationException e) {
						log.error("Unable to add to result list: "+ e);
					} catch (SQLException e) {  //ignore 
						log.error("Unable to add to result list: sqlexception:"+ e);
					}
				}
			}
			
		}

		public List<org.dspace.rtbf.rest.common.RTBObject> getLst() {
			return lst;
		}

		public void setLst(List<org.dspace.rtbf.rest.common.RTBObject> lst) {
			this.lst = lst;
		}
		
	}

	public static class Meta {

		private List<MetadataEntry> sortEntries;
		private MetadataWrapper sortMeta;

	    public Meta() {
	    	int idx = 1;
	    	String definition;
	    	
	    	sortEntries = new ArrayList<MetadataEntry>();
		    while ((definition = ConfigurationManager.getProperty(Constants.WEBAPP_NAME, Constants.SORTMETA+".field." + idx)) != null) {
		        List<String> fields = new ArrayList<String>();
		        fields = Arrays.asList(definition.split(":"));
	            sortEntries.add(new MetadataEntry(fields.get(0), fields.get(1), null));
		    	
		    	idx++;
		    }
	    }

	    @JsonIgnore
	    @XmlTransient
	    public List<MetadataEntry> getSortEntries() {
			return sortEntries;
		}

		public void setSortEntriest(List<MetadataEntry> entries) { // neither jaxb mor jackson
			this.sortEntries = entries;
		}

	    @JsonIgnore
		public MetadataWrapper getSortMeta() { // jaxb only
			if (sortEntries != null ) {
				sortMeta = new MetadataWrapper(sortEntries);
			}
			return sortMeta;
		}

		public void setSortMeta(MetadataWrapper wrapper) {
			this.sortMeta = wrapper;
		}

		@JsonGetter("sortMeta")
		@XmlTransient
		protected Map<String, Object> getMetadataEntriesAsMap() { // Jackson only
			return MetadataEntry.listAsMap(this.sortEntries);
		}
	}

	public static class Expanded {
		
	}

	public static class FacetsCount {
		
	}

	public static class Highlighting {
		
	}
	
}
