package org.dspace.content;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.dspace.content.ItemAdd.DiffusionItem;
import org.dspace.core.Constants;
import org.dspace.core.Context;
import org.dspace.storage.rdbms.DatabaseAccess;
import org.dspace.storage.rdbms.DatabaseManager;
import org.dspace.storage.rdbms.TableRow;
import org.dspace.storage.rdbms.TableRowIterator;

public class CollectionAdd extends Collection {

    public CollectionAdd(Collection collection) throws SQLException 
    {
        super(collection.ourContext, collection.getCollectionRow());
    }
        
    public static CollectionIterator findAllCursor(Context context) throws SQLException
    {
        String myQuery = "SELECT * FROM collection";

        TableRowIterator rows = DatabaseManager.queryTable(context, "collection", myQuery);

        return new CollectionIterator(context, rows);
    }

    public static CollectionIterator findByCommunity(Context context, int community_id) throws SQLException
    {
        String myQuery = "SELECT collection.* "
        		+ " FROM collection, community2collection"
                + " WHERE collection.collection_id = community2collection.collection_id"
                + " AND community2collection.community_id = " + community_id
                + " ORDER BY collection.collection_id";

        TableRowIterator rows = DatabaseManager.queryTable(context, "collection", myQuery);

        return new CollectionIterator(context, rows);
    }

    public static CollectionIterator findAllByCommunity(Context context, int community_id) throws SQLException
    {
        String myQuery = "SELECT collection.* "
        		+ " FROM collection, "
        		+ " ("
        		+ " SELECT c2col.community_id, c2col.collection_id"
        		+ " FROM community2collection c2col"
        		+ " UNION"
        		+ " SELECT c2c.parent_comm_id community_id, c2col.collection_id"
        		+ " FROM community2collection c2col, community2community c2c"
        		+ " WHERE c2c.parent_comm_id = " + community_id
        		+ " AND c2col.community_id = c2c.child_comm_id"
        		+ ") top2col"
        		+ " WHERE collection.collection_id = top2col.collection_id"
        		+ " AND top2col.community_id = " + community_id
                + " ORDER BY collection.collection_id";

        TableRowIterator rows = DatabaseManager.queryTable(context, "collection", myQuery);

        return new CollectionIterator(context, rows);
    }
    
    public static class DiffusionCollection extends Diffusion {

    	public DiffusionCollection(String diffusion_path, int community_id, int collection_id, int item_id, String date_event, String date_diffusion, String channel) {
    		this.community_id = community_id;
    		this.collection_id = collection_id;
    		this.item_id = item_id;
    		this.diffusion_path = diffusion_path;
    		this.date_event = date_event;
    		this.date_diffusion = date_diffusion;
    		this.channel = channel;
    	}
    	
        public static DiffusionCollection[] findById(Context context, int collection_id)
                throws SQLException
        {
        	String myQuery = "SELECT t.diffusion_path, c2c.community_id, t.resource_id collection_id, null item_id"
    	    	+ " , to_char(t.event_date,'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') date_event"
    	    	+ " , to_char(t.diffusion_datetime,'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') date_diffusion"
    	    	+ " , t.channel"
    	    	+ " FROM t_diffusion t"
    	    	+ " , community2collection c2c"
     	    	+ " WHERE resource_type_id = " + Constants.COLLECTION
    	    	+ " AND resource_id = " + collection_id
    	    	+ " AND c2c.collection_id = t.resource_id"    	
    	        + " ORDER BY t.diffusion_datetime";
        	
        	TableRowIterator tri =  null;
        	List<DiffusionCollection> collections = new ArrayList<DiffusionCollection> ();
        	
        	
        	try {
				tri =  DatabaseAccess.query(context, myQuery);
				while (tri.hasNext()) {
					TableRow row = tri.next();
					collections.add(new DiffusionCollection(
							row.getStringColumn("diffusion_path")
							, row.getIntColumn("community_id")
							, row.getIntColumn("collection_id")
							, row.getIntColumn("item_id")
							, row.getStringColumn("date_event")
							, row.getStringColumn("date_diffusion")
							, row.getStringColumn("channel")
					));
				}
			} finally {
				if (tri != null) { tri.close(); }
			}
        	
        	DiffusionCollection[] dct = new DiffusionCollection[collections.size()];
        	return collections.toArray(dct);
        	
        }

   }

}
