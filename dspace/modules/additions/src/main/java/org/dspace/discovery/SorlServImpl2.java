package org.dspace.discovery;

import java.sql.SQLException;

import org.apache.log4j.Logger;
import org.dspace.content.Collection;
import org.dspace.content.CollectionAdd;
import org.dspace.content.CollectionIterator;
import org.dspace.content.Community;
import org.dspace.content.CommunityAdd;
import org.dspace.content.CommunityIterator;
import org.dspace.content.Item;
import org.dspace.content.ItemAdd;
import org.dspace.content.ItemIterator;
import org.dspace.core.Context;
import org.dspace.discovery.SolrServiceImpl;

public class SorlServImpl2 extends SolrServiceImpl {

    public SorlServImpl2() {
    }

    private static final Logger log = Logger.getLogger(SorlServImpl2.class);

    
    public void updateIndexBig(Context context, boolean force)
    {
        try {
            CommunityIterator communities = null;
            try {
                for (communities = CommunityAdd.findAllCursor(context); communities.hasNext();)
                {
                    Community community = communities.next();
                    indexContent(context, community, force);
                    context.removeCached(community, community.getID());
                }
            } finally {
                if (communities != null)
                {
                    communities.close();
                }
            }

            CollectionIterator collections = null;
            try {
                for (collections = CollectionAdd.findAllCursor(context); collections.hasNext();)
                {
                    Collection collection = collections.next();
                    indexContent(context, collection, force);
                    context.removeCached(collection, collection.getID());
                }
            } finally {
                if (collections != null)
                {
                    collections.close();
                }
            }
            
            ItemIterator items = null;
            try {
                for (items = Item.findAllUnfiltered(context); items.hasNext();)
                {
                    Item item = items.next();
                    indexContent(context, item, force);
                    item.decache();
                }
            } finally {
                if (items != null)
                {
                    items.close();
                }
            }

            if(getSolr() != null)
            {
                getSolr().commit();
            }

        } catch (Exception e)
        {
            log.error(e.getMessage(), e);
        }
    }

    public void updateIndexI(Context context, int id, boolean force)
    {
        try {
            ItemIterator items = null;
            try {
                for (items = ItemAdd.findGeId(context, id); items.hasNext();)
                {
                    Item item = items.next();
                    indexContent(context, item, force);
                    item.decache();
                }
            } finally {
                if (items != null)
                {
                    items.close();
                }
            }

            if(getSolr() != null)
            {
                getSolr().commit();
            }

        } catch (Exception e)
        {
            log.error(e.getMessage(), e);
        }
    }
    
    
    public void updateIndexCC(Context context, boolean force)
    {
        try {
            CommunityIterator communities = null;
            try {
                for (communities = CommunityAdd.findAllCursor(context); communities.hasNext();)
                {
                    Community community = communities.next();
                    indexContent(context, community, force);
                    context.removeCached(community, community.getID());
                }
            } finally {
                if (communities != null)
                {
                    communities.close();
                }
            }

            CollectionIterator collections = null;
            try {
                for (collections = CollectionAdd.findAllCursor(context); collections.hasNext();)
                {
                    Collection collection = collections.next();
                    indexContent(context, collection, force);
                    context.removeCached(collection, collection.getID());
                }
            } finally {
                if (collections != null)
                {
                    collections.close();
                }
            }
            
            if(getSolr() != null)
            {
                getSolr().commit();
            }

        } catch (Exception e)
        {
            log.error(e.getMessage(), e);
        }
    }
    

    protected void indexCommunity(Context context, Community community, boolean force) 
            throws SQLException 
    {
        try {
            
            // Index the given community
            int id = community.getID();
            indexContent(context, community, force);
            context.removeCached(community, id);
    
            CollectionIterator collections = null;
            try {
                for (collections = CollectionAdd.findByCommunity(context, id); collections.hasNext();)
                {
                    Collection collection = collections.next();
                    indexContent(context, collection, force);
                    context.removeCached(collection, collection.getID());
                }
            } finally {
                if (collections != null)
                {
                    collections.close();
                }
            }
            
            ItemIterator items = null;
            try {
                for (items = ItemAdd.findByCommunity(context, id); items.hasNext();)
                {
                    Item item = items.next();
                    indexContent(context, item, force);
                    item.decache();
                }
            } finally {
                if (items != null)
                {
                    items.close();
                }
            }
    
            if(getSolr() != null)
            {
                getSolr().commit();
            }
    
        } catch (Exception e)
        {
            log.error(e.getMessage(), e);
        }
    }    
        
    
    public void updateIndexC(Context context, int id, boolean force)
    {
        try {
            Community community = Community.find(context, id);
            
            indexCommunity(context, community, force);
            
            if(getSolr() != null)
            {
                getSolr().commit();
            }

        } catch (Exception e)
        {
            log.error(e.getMessage(), e);
        }
    }
   

}
