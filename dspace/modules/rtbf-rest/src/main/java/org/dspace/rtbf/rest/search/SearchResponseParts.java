package org.dspace.rtbf.rest.search;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.WebApplicationException;
import javax.xml.bind.annotation.XmlElement;

import org.apache.log4j.Logger;
import org.dspace.content.Item;
import org.dspace.core.Constants;
import org.dspace.core.Context;
import org.dspace.discovery.DiscoverResult;
import org.dspace.rtbf.rest.common.DSpaceObject;
import org.dspace.rtbf.rest.common.Episode;
import org.dspace.rtbf.rest.common.Sequence;

public class SearchResponseParts {
    private static Logger log = Logger.getLogger(SearchResponseParts.class);
	
	public static class ResponseHeader {

	}

	public static class Result {
		
	    private List<org.dspace.rtbf.rest.common.DSpaceObject> lst;
	    
 		public Result(DiscoverResult queryResults, Context context) {
			int resultType = 0;
					
			if (queryResults != null && queryResults.getDspaceObjects().size() > 0) {
				
				lst = new ArrayList<org.dspace.rtbf.rest.common.DSpaceObject>();
				List<org.dspace.content.DSpaceObject> dsoList = queryResults.getDspaceObjects();
				
				if (! dsoList.isEmpty()) {
					resultType = dsoList.get(0).getType();
				}
				
	            for (org.dspace.content.DSpaceObject result : dsoList) {
					try {
						switch (resultType) {
						case Constants.ITEM:
							lst.add(new Sequence(org.dspace.rtbf.rest.common.DSpaceObject.SEARCH_RESULT_VIEW, (Item) result, "owningParentList", null));
						case Constants.COLLECTION:
//							lst.add(new Episode(org.dspace.rtbf.rest.common.DSpaceObject.SEARCH_RESULT_VIEW, (Collection) result, null, null));
						case Constants.COMMUNITY:
//							lst.add(new Serie(org.dspace.rtbf.rest.common.DSpaceObject.SEARCH_RESULT_VIEW, (Community) result, null, null));
						}
					} catch (WebApplicationException e) {
						log.error("Unable to add to result list: "+ e);
					} catch (SQLException e) {  //ignore 
						log.error("Unable to add to result list: sqlexception:"+ e);
					}
				}
			}
			
		}

		public List<org.dspace.rtbf.rest.common.DSpaceObject> getLst() {
			return lst;
		}

		public void setLst(List<org.dspace.rtbf.rest.common.DSpaceObject> lst) {
			this.lst = lst;
		}
		
	}

	public static class FacetsCount {
		
	}

	public static class Expanded {
		
	}

	public static class Highlighting {
		
	}
}
