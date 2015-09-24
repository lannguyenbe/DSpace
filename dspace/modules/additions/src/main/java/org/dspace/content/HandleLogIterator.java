package org.dspace.content;

import java.io.UnsupportedEncodingException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;

import org.apache.log4j.Logger;
import org.dspace.core.Context;
import org.dspace.storage.rdbms.DatabaseManager;
import org.dspace.storage.rdbms.TableRow;
import org.dspace.storage.rdbms.TableRowIterator;

/**
 * Specialized iterator for HandleLog. Inspired by ItemIterator
 * 
 * @author Lan Nguyen
 */
public class HandleLogIterator {
    /** log4j category */
    private static final Logger log = Logger.getLogger(HandleLogIterator.class);
	
	private Context ourContext;
	private TableRowIterator handleLogRows;
	
	
	public HandleLogIterator(Context context, String query, Object... parameters ) throws SQLException 
	{
		TableRowIterator rows = DatabaseAccess.query(context, this, query);

		ourContext = context;
		handleLogRows = rows;
		
	}
	
	public boolean hasNext() throws SQLException {
		if (handleLogRows != null) {
			return handleLogRows.hasNext();
		}
		return false;
	}

	public HandleLog next() throws SQLException {
		if (handleLogRows.hasNext()) {
			return new HandleLog(ourContext, handleLogRows.next());
		}
		return null;
	}
	
    public void close() {
		if (handleLogRows != null) {
			handleLogRows.close();
		}
    }

	
	/**
	 * Inner class
	 * @author nln
	 *
	 */
	class TableRowIterator {
	    /**
	     * Results from a query
	     */
	    private ResultSet results;

	    /**
	     * Statement used to submit the query
	     */
	    private Statement statemt = null;

	    /**
	     * Statement used to submit the query
	     */
	    private Connection connection = null;

	    /**
	     * The name of the RDBMS table
	     * not use
	    private String table; 
	     */

	    /**
	     * True if there is a next row
	     */
	    private boolean hasNext = true;

	    /**
	     * True if we have already advanced to the next row.
	     */
	    private boolean hasAdvanced = false;

	    /**
	     * Column names for the results in this query
	     */
	    private int numcols = 0;
	    private List<String> columnNames = null;
	    private List<Integer> columnTypes = null;


		public TableRowIterator(ResultSet results) {
			this.results = results;

			try {
				ResultSetMetaData meta = results.getMetaData();
				
				columnNames = new ArrayList<String>();
				columnTypes = new ArrayList<Integer>();
				numcols = meta.getColumnCount();
				for (int i = 0; i < numcols; i++) {
					columnNames.add(meta.getColumnLabel(i + 1));
					columnTypes.add(meta.getColumnType(i + 1));
				}
				
			} catch (SQLException e) {
				columnNames = null;
				columnTypes = null;
				numcols = 0;
			}
		}
		
	    public boolean hasNext() throws SQLException
	    {
	        if (results == null)
	        {
	            close();
	            return false;
	        }

	        if (hasAdvanced)
	        {
	            return hasNext;
	        }

	        hasAdvanced = true;
	        hasNext = results.next();

	        // No more results
	        if (!hasNext)
	        {
	            close();
	        }

	        return hasNext;
	    }

	    public TableRow next() throws SQLException
	    {
	        if (results == null)
	        {
	            return null;
	        }

	        if (!hasNext())
	        {
	            return null;
	        }

	        hasAdvanced = false;

	        return process(results);
	    }
	    
	    private TableRow process(ResultSet results) throws SQLException {
	    	TableRow row = new TableRow(null, columnNames);

	    	for (int i = 0, j = i+1; i < numcols; i++, j++) {
	    		int jdbctype = columnTypes.get(i);
	    		String name = columnNames.get(i);

	    		switch (jdbctype) {
		    		case Types.BOOLEAN:
		    		case Types.BIT:
		    			row.setColumn(name, results.getBoolean(j));
		    			break;
		    			
		    		case Types.INTEGER: /* isOracle */
		    			long longValue = results.getLong(j);
		    			if (longValue <= (long)Integer.MAX_VALUE) {
		    				row.setColumn(name, (int) longValue);
		    			} else {
		    				row.setColumn(name, longValue);
		    			}
		    			break;
		    				    			
	                case Types.BIGINT:
	                    row.setColumn(name, results.getLong(j));
	                    break;
	
	                case Types.NUMERIC:
	                case Types.DECIMAL:
	                    row.setColumn(name, results.getBigDecimal(j));
	                    break;
	
	                case Types.DOUBLE:
	                    row.setColumn(name, results.getDouble(j));
	                    break;
	
	                case Types.CLOB: /* is Oracle */
	                	row.setColumn(name, results.getString(j));
	                	break;
	                	
	                case Types.VARCHAR:
	                    try
	                    {
	                        byte[] bytes = results.getBytes(j);
	
	                        if (bytes != null)
	                        {
	                            String mystring = new String(results.getBytes(j), "UTF-8");
	                            row.setColumn(name, mystring);
	                        }
	                        else
	                        {
	                            row.setColumn(name, results.getString(j));
	                        }
	                    }
	                    catch (UnsupportedEncodingException e)
	                    {
	                        log.error("Unable to parse text from database", e);
	                    }
	                    break;
	
	                case Types.DATE:
	                    row.setColumn(name, results.getDate(j));
	                    break;
	
	                case Types.TIME:
	                    row.setColumn(name, results.getTime(j));
	                    break;
	
	                case Types.TIMESTAMP:
	                    row.setColumn(name, results.getTimestamp(j));
	                    break;
	
	                default:
	                    throw new IllegalArgumentException("Unsupported JDBC type: " + jdbctype);
	    		}

		    	if (results.wasNull()) {
		    		row.setColumnNull(name);
		    	}
	    	}

	    	// not changed
	    	// row.resetChanged(); // function not visible
	    	return row;
	    }


		public void setStatement(PreparedStatement statement) {
			this.statemt = statement;
		}

		public void setConnection(Connection conn) {
			this.connection = conn;			
		}

	    /**
	     * Close the Iterator and release any associated resources
	     */
	    public void close()
	    {
	        try
	        {
	            if (results != null) { results.close(); results = null; }
	            if (statemt != null) { statemt.close(); statemt = null; }
//	            if (connection != null) { connection.close(); connection = null; }
	        }
	        catch (SQLException sqle)
	        {
	        }

	        columnNames = null;
	        columnTypes = null;
	        numcols = 0;
	    }

	
	} /* class TableRowIterator */
	
	static class DatabaseAccess {
		private static Connection connection;

		public static TableRowIterator query(Context context, HandleLogIterator hl, String query) throws SQLException {
			Connection conn = getConnection(context);			
	        PreparedStatement statement = null;
	        
	        try
	        {
	        	statement = conn.prepareStatement(query);

	            TableRowIterator retTRI = hl.new TableRowIterator(statement.executeQuery());

	            retTRI.setStatement(statement);
	            return retTRI;
	        }
	        catch (SQLException sqle) 
	        {
	            if (statement != null)
	            {
	                try
	                {
	                    statement.close();
	                }
	                catch (SQLException s)
	                {
	                    log.error("SQL query close Error - ",s);
	                    throw s;
	                }
	            }
	            log.error("SQL query Error - ",sqle);
	            throw sqle;
	        }
	    }

		public static void execute(Context context, String sql) throws SQLException {
			Connection conn = getConnection(context);			
	        PreparedStatement statement = null;

	        try
	        {
	            statement = connection.prepareStatement(sql);
	            statement.execute();
	        }
	        catch (SQLException sqle) {
                log.error("SQL execute Error - ", sqle);
                throw sqle;
	        }
	        finally {
	            if (statement != null) {
	                try {
	                    statement.close();
	                }
	                catch (SQLException sqle) {
	                    log.error("SQL execute close Error - ", sqle);
	                    throw sqle;
	                }
	            }
	        }
	    }

		public static void executeTransaction(Context context, String... sqls) throws SQLException {
			Connection conn = getConnection(context);			
	        List<PreparedStatement> statements = null;

	        try {
	        	conn.setAutoCommit(false);
	        	statements = new ArrayList<PreparedStatement>();
	        	for (int i = 0, len = sqls.length; i < len; i++) {
	        		PreparedStatement stmt = connection.prepareStatement(sqls[i]);
	        		stmt.execute();
		            statements.add(stmt);
	        	}
	        	conn.commit();
	        }
	        catch (SQLException sqle) {
	        	conn.rollback();      	
                log.error("SQL executeTransaction Error - ", sqle);
                throw sqle;
	        }
	        finally  {
	            if (statements != null) {
	                try  {
	                	for (PreparedStatement stmt : statements) {
	                		stmt.close();
	                	}
	                }
	                catch (SQLException sqle) {
	                    log.error("SQL executeTransaction close Error - ", sqle);
	                    throw sqle;
	                }
	            }
	            if (conn != null) {
	            	conn.setAutoCommit(true);
	            }
	        }
	    }


		public static Connection getConnection(Context context) throws SQLException {
			if (connection == null) {
	            connection = context.getDBConnection();
/*	        	connection = getMyConnection();*/
			}
			return connection;
		}
		
		public static Connection getMyConnection() throws SQLException {
			try {
				Class.forName("oracle.jdbc.OracleDriver");
			} catch(ClassNotFoundException e) {
	            log.error("getConnection - ",e);
				return null;
			} 

			Connection conn = null;
			String currentUrlString = null;

			currentUrlString= "jdbc:oracle:thin:argus2/argus@oda11:1521:utf";
			conn = DriverManager.getConnection(currentUrlString);

			return conn;
		}

	} /* class DataBaseManager */

}
