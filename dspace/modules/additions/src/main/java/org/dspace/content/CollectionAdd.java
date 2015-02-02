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
        String myQuery = "SELECT collection.* FROM collection, community2collection"
                + " WHERE collection.collection_id = community2collection.collection_id"
                + " AND community2collection.community_id = " + community_id
                + " ORDER BY collection.name";

        TableRowIterator rows = DatabaseManager.queryTable(context, "collection", myQuery);

        return new CollectionIterator(context, rows);
    }
    

}
