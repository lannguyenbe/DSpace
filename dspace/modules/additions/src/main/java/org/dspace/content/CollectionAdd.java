package org.dspace.content;

import java.sql.SQLException;

import org.dspace.core.Context;
import org.dspace.storage.rdbms.DatabaseManager;
import org.dspace.storage.rdbms.TableRow;
import org.dspace.storage.rdbms.TableRowIterator;

public class CollectionAdd extends Collection {

    public CollectionAdd(Context context, TableRow row) throws SQLException {
        super(context, row);
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
    

}
