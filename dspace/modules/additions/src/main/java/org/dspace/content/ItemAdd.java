package org.dspace.content;

import java.io.Serializable;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.apache.log4j.Logger;
import org.dspace.core.Constants;
import org.dspace.core.Context;
import org.dspace.storage.rdbms.DatabaseManager;
import org.dspace.storage.rdbms.TableRow;
import org.dspace.storage.rdbms.TableRowIterator;
import org.dspace.storage.rdbms.DatabaseAccess;

public class ItemAdd extends Item {
	private static Logger log = Logger.getLogger(ItemAdd.class);

    
    public ItemAdd(Item item) throws SQLException
    {
        super(item.ourContext, item.getItemRow());
    }
    
    public static ItemIterator findAllUnfiltered(Context context) throws SQLException
    {
        String myQuery = "SELECT * FROM item WHERE in_archive='1' or withdrawn='1'"
                + " ORDER BY item.item_id";

        TableRowIterator rows = DatabaseManager.queryTable(context, "item", myQuery);

        return new ItemIterator(context, rows);
    }

    public static ItemIterator findAllUnfiltered(Context context, Integer limit, Integer offset) throws SQLException
    {
        List<Serializable> params = new ArrayList<Serializable>();
        StringBuffer myQuery = new StringBuffer(
            "SELECT item.*"
            + " FROM item"
        );

        DatabaseManager.applyOffsetAndLimit(myQuery, params, offset, limit);

        TableRowIterator rows = DatabaseManager.query(context,
                myQuery.toString(), params.toArray());

        return new ItemIterator(context, rows);
    }

    public static ItemIterator findGeId(Context context, int id) throws SQLException
    {
        String myQuery = "SELECT * FROM item WHERE in_archive='1' AND item_id >="+id
                + " ORDER BY item.item_id";

        TableRowIterator rows = DatabaseManager.queryTable(context, "item", myQuery);

        return new ItemIterator(context, rows);
    }
    
    public static ItemIterator findBetweenId(Context context, int id, int idto) throws SQLException
    {
        String myQuery = "SELECT * FROM item WHERE in_archive='1' AND item_id between "+id
        		+ " and "+idto
                + " ORDER BY item.item_id";

        TableRowIterator rows = DatabaseManager.queryTable(context, "item", myQuery);

        return new ItemIterator(context, rows);
    }
    
    public static ItemIterator findByCollection(Context context, int collection_id)
            throws SQLException
    {
        String myQuery = "SELECT item.* FROM item, collection2item"
                + " WHERE in_archive='1'"
                + " AND item.item_id = collection2item.item_id"
                + " AND collection2item.collection_id = " + collection_id
                + " ORDER BY item.item_id";

        TableRowIterator rows = DatabaseManager.queryTable(context, "item", myQuery);

        return new ItemIterator(context, rows);
    }
    
    public static ItemIterator findByCommunity(Context context, int community_id)
            throws SQLException
    {
        String myQuery = "SELECT item.*"
                + " FROM item, topcommunity2item"
                + " WHERE topcommunity2item.parent_comm_id = " + community_id
                + " AND item.item_id = topcommunity2item.item_id"
                + " ORDER BY item.item_id";

        TableRowIterator rows = DatabaseManager.queryTable(context, "item", myQuery);

        return new ItemIterator(context, rows);
    }

    public static ItemIterator findGeIdByCommunity(Context context, int community_id, int item_id)
            throws SQLException
    {
        String myQuery = "SELECT item.*"
                + " FROM item, "
        		+ " (select community_id, item_id from community2item"
        		+ " union"
        		+ " select  cc.parent_comm_id community_id ,c2i.item_id"
        		+ " from community2item c2i, community2community cc"
        		+ " where cc.parent_comm_id = " + community_id
        		+ " and cc.child_comm_id = c2i.community_id"
                + " ) topcommunity2item"
                + " WHERE topcommunity2item.community_id = " + community_id
                + " AND item.item_id = topcommunity2item.item_id"
                + " AND item.item_id >= " + item_id
                + " ORDER BY item.item_id";

        TableRowIterator rows = DatabaseManager.queryTable(context, "item", myQuery);

        return new ItemIterator(context, rows);
    }

    public static ItemIterator findBetweenIdByCommunity(Context context, int community_id, int item_id, int item_id_to)
            throws SQLException
    {
        String myQuery = "SELECT item.*"
                + " FROM item, "
        		+ " (select community_id, item_id from community2item"
        		+ " union"
        		+ " select  cc.parent_comm_id community_id ,c2i.item_id"
        		+ " from community2item c2i, community2community cc"
        		+ " where cc.parent_comm_id = " + community_id
        		+ " and cc.child_comm_id = c2i.community_id"
                + " ) topcommunity2item"
                + " WHERE topcommunity2item.community_id = " + community_id
                + " AND item.item_id = topcommunity2item.item_id"
                + " AND item.item_id between " + item_id + " and " + item_id_to
                + " ORDER BY item.item_id";

        TableRowIterator rows = DatabaseManager.queryTable(context, "item", myQuery);

        return new ItemIterator(context, rows);
    }
    
    public List<String> findChannelsIssuedById()
            throws SQLException
    {
    	int item_id = this.getID();
    	String myQuery = "SELECT distinct diff.channel"
        	+ " from"
        	+ " (SELECT d.resource_type_id, d.resource_id, d.diffusion_path"
        	+ " FROM t_diffusion d"
        	+ " WHERE d.resource_type_id = " + Constants.ITEM
        	+ " AND d.resource_id = " + item_id
        	+ " AND d.is_premdiff = 1) premdiff"
        	+ " , t_diffusion diff"
        	+ " WHERE diff.resource_type_id = premdiff.resource_type_id"
        	+ " AND diff.resource_id = premdiff.resource_id"
        	+ " AND diff.diffusion_path = premdiff.diffusion_path"
        	+ " ORDER BY diff.channel";
    	
    	        	
    	TableRowIterator tri =  null;
    	List<String> channels = new ArrayList<String> ();
    	    	
    	try {
			tri =  DatabaseAccess.query(this.ourContext, myQuery);
			while (tri.hasNext()) {
				TableRow row = tri.next();
				channels.add( row.getStringColumn("channel"));
			}
		} finally {
			if (tri != null) { tri.close(); }
		}
    	
    	if (channels.isEmpty()) { return null; }

    	return channels;
    }
     

    public static class DiffusionItem {
    	
    	private String diffusion_path = null;
        private int community_id = -1;
        private int collection_id = -1;
        private int item_id = -1;
    	private String date_event = null;
    	private String date_diffusion = null;
    	private String channel_event = null;
    	
    	public DiffusionItem(String diffusion_path, int community_id, int collection_id, int item_id, String date_event, String date_diffusion, String channel_event) {
    		this.diffusion_path = diffusion_path;
    		this.community_id = community_id;
    		this.collection_id = collection_id;
    		this.item_id = item_id;
    		this.date_event = date_event;
    		this.date_diffusion = date_diffusion;
    		this.channel_event = channel_event;
    	}
    	
        public static DiffusionItem[] findById(Context context, int item_id)
                throws SQLException
        {
        	String myQuery = "SELECT t.diffusion_path, c2c.community_id, t.collection_id, t.resource_id item_id"
    	    	+ " , to_char(t.event_date,'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') date_event"
    	    	+ " , to_char(t.diffusion_dt,'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') date_diffusion"
    	    	+ " , t.channel_event"
    	    	+ " FROM"
    	    	+ " (SELECT diffusion_path, resource_id, collection_id, event_date"
    	    	+ "  , min(diffusion_datetime) diffusion_dt"
    	    	+ "  , sum(is_premdiff) premdiff"
    	    	+ "  , min(channel) keep (dense_rank first order by diffusion_datetime) channel_event"
    	    	+ " FROM t_diffusion"
    	    	+ " WHERE resource_type_id = " + Constants.ITEM
    	    	+ " and resource_id = " + item_id
    	    	+ " AND diffusion_path IS NOT NULL"
    	    	+ " GROUP BY diffusion_path, resource_id, collection_id, event_date"
    	    	+ " ) t,"
    	    	+ " community2collection c2c"
    	    	+ " WHERE t.premdiff = 0"
    	    	+ " AND c2c.collection_id = t.collection_id"    	
    	        + " ORDER BY t.event_date";
        	
        	TableRowIterator tri =  null;
        	List<DiffusionItem> items = new ArrayList<DiffusionItem> ();
        	
        	
        	try {
				tri =  DatabaseAccess.query(context, myQuery);
				while (tri.hasNext()) {
					TableRow row = tri.next();
					items.add(new DiffusionItem(
							row.getStringColumn("diffusion_path")
							, row.getIntColumn("community_id")
							, row.getIntColumn("collection_id")
							, row.getIntColumn("item_id")
							, row.getStringColumn("date_event")
							, row.getStringColumn("date_diffusion")
							, row.getStringColumn("channel_event")
					));
				}
			} finally {
				if (tri != null) { tri.close(); }
			}
        	
        	DiffusionItem[] dit = new DiffusionItem[items.size()];
        	return items.toArray(dit);
        	
        }

        public String getDiffusion_path() {
			return diffusion_path;
		}

		public int getCommunity_id() {
			return community_id;
		}

		public int getCollection_id() {
			return collection_id;
		}

		public int getItem_id() {
			return item_id;
		}

		public String getDate_event() {
			return date_event;
		}

		public String getDate_diffusion() {
			return date_diffusion;
		}

		public String getChannel_event() {
			return channel_event;
		}
    }
    
}
