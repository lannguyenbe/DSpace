package org.dspace.content;

import java.sql.SQLException;

import org.dspace.core.Context;
import org.dspace.storage.rdbms.DatabaseManager;
import org.dspace.storage.rdbms.TableRow;
import org.dspace.storage.rdbms.TableRowIterator;

public class ItemAdd extends Item {
    
    ItemAdd(Context context, TableRow row) throws SQLException
    {
        super(context, row);
    }
    
    public static ItemIterator findAllUnfiltered(Context context) throws SQLException
    {
        String myQuery = "SELECT * FROM item WHERE in_archive='1' or withdrawn='1'"
                + " ORDER BY item.item_id";

        TableRowIterator rows = DatabaseManager.queryTable(context, "item", myQuery);

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

}
