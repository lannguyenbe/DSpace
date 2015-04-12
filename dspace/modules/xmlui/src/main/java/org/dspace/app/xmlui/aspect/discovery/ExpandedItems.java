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

import org.apache.cocoon.environment.ObjectModelHelper;
import org.apache.cocoon.environment.Request;
import org.apache.commons.collections.CollectionUtils;
import org.apache.log4j.Logger;
import org.dspace.app.xmlui.cocoon.AbstractDSpaceTransformer;
import org.dspace.app.xmlui.utils.HandleUtil;
import org.dspace.app.xmlui.utils.UIException;
import org.dspace.app.xmlui.wing.Message;
import org.dspace.app.xmlui.wing.WingException;
import org.dspace.app.xmlui.wing.element.*;
import org.dspace.authorize.AuthorizeException;
import org.dspace.content.DSpaceObject;
import org.dspace.content.Item;
import org.dspace.core.Context;
import org.dspace.discovery.DiscoverQuery;
import org.dspace.discovery.DiscoverResult;
import org.dspace.discovery.SearchService;
import org.dspace.discovery.SearchServiceException;
import org.dspace.discovery.SearchUtils;
import org.dspace.discovery.DiscoverResult.SearchDocument;
import org.dspace.discovery.configuration.DiscoveryConfiguration;
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
    protected DiscoverResult queryResults;
    protected DiscoverQuery queryArgs;
    protected DSpaceObject dso;


    public ExpandedItems(Context context, DSpaceObject dso){
        this.dso = dso;
        this.context = context;
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
            performSearch();
        }catch (Exception e){
            log.error("Error while searching for expanded items", e);

            return;
        }
        
        if (queryResults != null && 0 < queryResults.getDspaceObjects().size()) {
            // normally exactly 1 result
            DSpaceObject resultDso = queryResults.getDspaceObjects().get(0);
            String handle = dso.getHandle();
            Division expandDiv = null;

            if (!handle.equals(resultDso.getHandle())) {
                expandDiv = body.addDivision("item-expanded");
                expandDiv.addPara().addContent(resultDso.getHandle());
                
                // resultDso.getMetaData("dc.title") ????
                
            }
            
            List<DiscoverResult.SearchDocument> expandDocuments = queryResults.getExpandDocuments(resultDso);
            if (expandDocuments != null && expandDocuments.size() > 0) {
                for (SearchDocument docE : expandDocuments) {
                    String handleE = docE.getSearchFieldValues("handle").get(0);
                    String titleE = docE.getSearchFieldValues("dc.title").get(0);
                    if (!handle.equals(handleE)) {
                        expandDiv = (expandDiv == null) ? body.addDivision("item-expanded") : expandDiv;                            
                        expandDiv.addPara().addContent(handleE);                        
                        expandDiv.addPara().addContent(titleE);                        
                    }
                }
            }
        }

    }
    
    
}
