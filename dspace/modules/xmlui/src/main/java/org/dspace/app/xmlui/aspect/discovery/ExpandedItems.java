/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
package org.dspace.app.xmlui.aspect.discovery;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

import org.apache.log4j.Logger;
import org.dspace.app.xmlui.utils.UIException;
import org.dspace.app.xmlui.wing.WingException;
import org.dspace.app.xmlui.wing.element.*;
import org.dspace.app.xmlui.wing.Message;
import org.dspace.authorize.AuthorizeException;
import org.dspace.content.DSpaceObject;
import org.dspace.core.Context;
import org.dspace.discovery.DiscoverQuery;
import org.dspace.discovery.DiscoverResult;
import org.dspace.discovery.SearchService;
import org.dspace.discovery.SearchServiceException;
import org.dspace.discovery.DiscoverResult.SearchDocument;
import org.dspace.utils.DSpace;
import org.xml.sax.SAXException;

/**
 * Displays related items to the currently viewable item
 *
 * @author Kevin Van de Velde (kevin at atmire dot com)
 * @author Mark Diggory (markd at atmire dot com)
 * @author Ben Bosman (ben at atmire dot com)
 */
public class ExpandedItems /*extends AbstractDSpaceTransformer*/
{
    private static final Logger log = Logger.getLogger(ExpandedItems.class);
    
    protected Context context;
    protected String contextPath;    
    protected DiscoverResult queryResults;
    protected DiscoverQuery queryArgs;
    protected DSpaceObject dso;


    public ExpandedItems(Context context, String contextPath, DSpaceObject dso){
        this.dso = dso;
        this.context = context;
        this.contextPath = contextPath;
    }
    
    protected SearchService getSearchService()
    {
        DSpace dspace = new DSpace();
        
        org.dspace.kernel.ServiceManager manager = dspace.getServiceManager() ;

        return manager.getServiceByName(SearchService.class.getName(),SearchService.class);
    }
    
    public void performSearch() throws SearchServiceException, UIException, SQLException {

        DiscoverQuery query = new DiscoverQuery();
        String handle = dso.getHandle();
        query.addSearchField("dc.title");
        query.addSearchField("identifier_attributor");
        // This is a join query : where identifier_origin in (select identifier_origin where handle = <handle>)
        query.addFilterQueries("{!join from=identifier_origin to=identifier_origin}handle:"+handle);

        queryResults =  getSearchService().search(context, query);
    }

    /**
     * Display items related to the given item
     */
    public void addBody(Body body) throws SAXException, WingException,
            SQLException, IOException, AuthorizeException
    {

        try {
            // Questionne solr for expanded results
            performSearch(); 
        }catch (Exception e){
            log.error("Error while searching for expanded items", e);

            return;
        }
        
        if (queryResults != null && 0 < queryResults.getDspaceObjects().size()) {
            // normally exactly 1 result that represents the most representativ of the items having the same indentifier_origin
            // the return result may have a different handle from the one we are questionning 
            DSpaceObject resultDso = queryResults.getDspaceObjects().get(0);
            String handle = dso.getHandle(); // initial handle
            Division expandDiv = null;

            if (!handle.equals(resultDso.getHandle())) {
                // take the first doc, should be the only one
                DiscoverResult.SearchDocument doc = queryResults.getSearchDocument(resultDso).get(0);
                expandDiv = body.addDivision("item-expanded");
                
                String link = contextPath + "/handle/" + handle;
                String title = doc.getSearchFieldValues("dc.title").get(0);
                expandDiv.addPara().addXref(link).addContent(title);
                
                String source = doc.getSearchFieldValues("identifier_attributor").get(0);
                expandDiv.addPara().addContent(message(source));                
            }
            
            List<DiscoverResult.SearchDocument> expandDocuments = queryResults.getExpandDocuments(resultDso);
            if (expandDocuments != null && expandDocuments.size() > 0) {
                for (SearchDocument docE : expandDocuments) {
                    String handleE = docE.getSearchFieldValues("handle").get(0);
                    if (!handle.equals(handleE)) {
                        expandDiv = (expandDiv == null) ? body.addDivision("item-expanded") : expandDiv;
                        
                        String link = contextPath + "/handle/" + handleE;
                        String title = docE.getSearchFieldValues("dc.title").get(0);
                        expandDiv.addPara().addXref(link).addContent(title);
                        
                        String sourceE = docE.getSearchFieldValues("identifier_attributor").get(0);
                        expandDiv.addPara(message(sourceE));                         
                     }
                }
            }
        }

    }
    
    public static Message message(String key)
    {
        return new Message("default", key);
    }

    
}
