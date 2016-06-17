package org.dspace.content;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.dspace.content.ItemAdd.DiffusionItem;
import org.dspace.content.ItemAdd.SupportItem;
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

    public static class SupportCollection extends Support {

    	public SupportCollection(TableRow row) {
    		super(row);
    	}

    	public static SupportCollection[] findById(Context context, int collection_id)
    			throws SQLException
    			{
    		String myQuery = "SELECT distinct"
    				+ " t.code_origine"
    				+ " , t.support_type"
    				+ " , t.set_of_support_type"
    				+ " , t.support_place"
    				+ " , t.key_frame_offset"
    				+ " , t.tc_in, t.tc_out, t.htc_in, t.htc_out, t.duration"
    				+ " , t.tc_in_string, t.tc_out_string, t.htc_in_string, t.htc_out_string, t.duration_string"
    				+ " , t.origine"
    				+ " , t.category"
    				+ " FROM t_support2resource t"
    				+ " WHERE resource_type_id = " + Constants.COLLECTION
    				+ " AND resource_id = " + collection_id
        	        + " ORDER BY t.set_of_support_type";

    		TableRowIterator tri =  null;
    		List<SupportCollection> supports = new ArrayList<SupportCollection> ();


    		try {
    			tri =  DatabaseAccess.query(context, myQuery);
    			while (tri.hasNext()) {
    				supports.add(new SupportCollection(tri.next()));
    			}
    		} finally {
    			if (tri != null) { tri.close(); }
    		}

    		SupportCollection[] arr = new SupportCollection[supports.size()];
    		return supports.toArray(arr);

    	}
    }
    
    public static class CodeOrigineCollection extends CodeOrigine {

    	public CodeOrigineCollection(TableRow row) {
    		super(row);
    	}

    	public static CodeOrigineCollection[] findById(Context context, int collection_id)
    			throws SQLException
    			{
    		String myQuery = "SELECT distinct co.id, co.code_origine, co.topcommunity_id"
		    		+ " FROM t_codeorigine co, t_support2resource s2r"
		    		+ " WHERE s2r.resource_type_id = " + Constants.COLLECTION
		    		+ " AND s2r.resource_id = "+ collection_id
		    		+ " AND co.code_origine = s2r.code_origine"
		    		+ " AND co.topcommunity_id = ("
		    		+ "    SELECT top.topcommunity_id"
		    		+ "    FROM v_topcommunity top"
		    		+ "    WHERE top.resource_type_id = s2r.resource_type_id"
		    		+ "    AND top.resource_id = s2r.resource_id"
		    		+ " )"
		    		;    		
    		
    		TableRowIterator tri =  null;
    		List<CodeOrigineCollection> codes = new ArrayList<CodeOrigineCollection> ();


    		try {
    			tri =  DatabaseAccess.query(context, myQuery);
    			while (tri.hasNext()) {
    				codes.add(new CodeOrigineCollection(tri.next()));
    			}
    		} finally {
    			if (tri != null) { tri.close(); }
    		}

    		CodeOrigineCollection[] arr = new CodeOrigineCollection[codes.size()];
    		return codes.toArray(arr);

    	}
    }
    



}
