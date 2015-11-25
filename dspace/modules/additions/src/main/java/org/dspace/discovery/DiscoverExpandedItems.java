package org.dspace.discovery;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.dspace.content.DSpaceObject;
import org.dspace.core.Context;
import org.dspace.discovery.DiscoverResult.SearchDocument;
import org.dspace.utils.DSpace;

public class DiscoverExpandedItems {

    private static final Logger log = Logger.getLogger(DiscoverExpandedItems.class);
    
    protected Context context;
    protected DiscoverResult queryResults;
    protected DiscoverQuery queryArgs;
    protected DSpaceObject dso;
    
    public DiscoverExpandedItems(Context context, DSpaceObject dso){
        this.dso = dso;
        this.context = context;
    }
    
    protected SearchService getSearchService()
    {
        DSpace dspace = new DSpace();
        
        org.dspace.kernel.ServiceManager manager = dspace.getServiceManager() ;

        return manager.getServiceByName(SearchService.class.getName(),SearchService.class);
    }
    
    // TODO : externalize searchFields in config
    private static String[] searchFields = {"dc.title", "identifier_attributor", "dcterms.isPartOf.title"};
    public void performSearch() throws SearchServiceException, SQLException {

        DiscoverQuery query = new DiscoverQuery();
        String handle = dso.getHandle();
        
        for (String sf : searchFields) {
        	query.addSearchField(sf);			
		}
        // Join search
        query.addFilterQueries("{!join from=identifier_origin to=identifier_origin}handle:"+handle);
        
        queryResults =  getSearchService().search(context, query);
    }

    /**
     * List of items related to the given item
     */
    public List<DiscoverResult.SearchDocument> getItems() 
    {

        List<DiscoverResult.SearchDocument> expandList = new ArrayList<DiscoverResult.SearchDocument>();

        try {
            // Questionne solr for expanded results
            performSearch(); 
        }catch (Exception e){
            log.error("Error while searching for expanded items", e);

            return expandList;
        }
                
        if (queryResults != null && 0 < queryResults.getDspaceObjects().size()) {
            // normally exactly 1 result that represents the most representativ of the items having the same indentifier_origin
            // the return result may have a different handle from the one we are questionning 
            DSpaceObject resultDso = queryResults.getDspaceObjects().get(0);
            String handle = dso.getHandle(); // questionning handle

            if (!handle.equals(resultDso.getHandle())) { // result handle and questionning handle are different
                // take the first doc, should be the only one
                DiscoverResult.SearchDocument doc = queryResults.getSearchDocument(resultDso).get(0);
                expandList.add(doc);
            }
            
            List<DiscoverResult.SearchDocument> expandDocuments = queryResults.getExpandDocuments(resultDso);
            for (SearchDocument docE : expandDocuments) {
            	String handleE = docE.getSearchFieldValues("handle").get(0);
            	if (!handle.equals(handleE)) {
            		expandList.add(docE);
            	}
            }
        }
        
        return expandList;
    }

}
