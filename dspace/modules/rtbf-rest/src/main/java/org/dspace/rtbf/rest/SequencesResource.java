/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
package org.dspace.rtbf.rest;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.apache.log4j.Logger;
import org.dspace.content.ItemIterator;
import org.dspace.rtbf.rest.common.Constants;
import org.dspace.rtbf.rest.common.MetadataEntry;
import org.dspace.rtbf.rest.common.MetadataWrapper;
import org.dspace.rtbf.rest.common.Sequence;
import org.dspace.rtbf.rest.common.Serie;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;


/**
 * Class which provide all CRUD methods over items.
 * 
 * @author Rostislav Novak (Computing and Information Centre, CTU in Prague)
 *
 * 18.10.2015 Lan : Restrict to GET only
 * 
 */
// Every DSpace class used without namespace is from package org.dspace.rest.common.*. Otherwise namespace is defined.
@SuppressWarnings("deprecation")
@Path("/sequences")
public class SequencesResource extends Resource
{

    private static final Logger log = Logger.getLogger(SequencesResource.class);


    /**
     * It returns an array of items in DSpace. You can define how many items in
     * list will be and from which index will start. Items in list are sorted item_id
     * 
     * @param limit
     *            How many items in array will be. Default value is 100.
     * @param offset
     *            On which index will array start. Default value is 0.
     */
    @GET
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public Sequence[] getSequences(@QueryParam("expand") String expand, @QueryParam("limit") @DefaultValue("100") Integer limit,
            @QueryParam("offset") @DefaultValue("0") Integer offset, @QueryParam("userIP") String user_ip,
            @QueryParam("userAgent") String user_agent, @QueryParam("xforwardedfor") String xforwardedfor,
            @Context HttpHeaders headers, @Context HttpServletRequest request) throws WebApplicationException
    {

    	int viewType = Constants.MIN_VIEW;

        log.info("Reading items.(offset=" + offset + ",limit=" + limit + ").");
        org.dspace.core.Context context = null;
        List<Sequence> sequences = null;

        try
        {
            context = new org.dspace.core.Context();
            context.getDBConnection().setAutoCommit(true);

            if (!((limit != null) && (limit >= 0) && (offset != null) && (offset >= 0)))
            {
                log.warn("Pagging was badly set, using default values.");
                limit = 100;
                offset = 0;
            }

            ItemIterator dspaceItems = org.dspace.content.ItemAdd.findAllUnfiltered(context, limit, offset);
            sequences = new ArrayList<Sequence>();

            while(dspaceItems.hasNext()) {
                org.dspace.content.Item item = dspaceItems.next();
                	sequences.add(new Sequence(viewType, item, null, context));
            }

            context.complete();
        }
        catch (SQLException e)
        {
            processException("Something went wrong while reading items from database. Message: " + e, context);
        }
        finally
        {
            processFinally(context);
        }

        log.trace("Items were successfully read.");
        return sequences.toArray(new Sequence[0]);
    }

    /**
     * Returns item
     * 
     */
    @GET
    @Path("/{item_id}")
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public Sequence getSequence(@PathParam("item_id") Integer itemId, @QueryParam("expand") String expand,
            @QueryParam("userIP") String user_ip, @QueryParam("userAgent") String user_agent,
            @QueryParam("xforwardedfor") String xforwardedfor, @Context HttpHeaders headers, @Context HttpServletRequest request)
            throws WebApplicationException
    {
    	int viewType = Constants.MIN_VIEW;
    	
    	if (expand != null) {
    		List<String> expandFields = Arrays.asList(expand.split(","));
        	if(expandFields.contains("enable")) {
        		viewType = Constants.EXPANDELEM_VIEW;
            }
    	}
    	
    	log.info("Reading item(id=" + itemId + ") metadata.");
        org.dspace.core.Context context = null;
        Sequence sequence = null;

        try
        {
            context = new org.dspace.core.Context();
            context.getDBConnection().setAutoCommit(true);
            org.dspace.content.Item dspaceItem = findItem(context, itemId, org.dspace.core.Constants.READ);

            sequence = new org.dspace.rtbf.rest.common.Sequence(viewType, dspaceItem, expand+","+Constants.SEQUENCE_EXPAND_OPTIONS, context);
            context.complete();
        }
        catch (SQLException e)
        {
            processException("Could not read item(id=" + itemId + "), SQLException. Message: " + e, context);
        }
        finally
        {
            processFinally(context);
        }

        log.trace("Item(id=" + itemId + ") was successfully read.");
        return sequence;
    }


    /**
     * Returns item metadata 
     * 
     */
    @GET
    @Path("/{item_id}/metadata")
    @Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
    public MetadataEntry[] getSequenceMetadata(@PathParam("item_id") Integer itemId, @QueryParam("userIP") String user_ip,
            @QueryParam("userAgent") String user_agent, @QueryParam("xforwardedfor") String xforwardedfor,
            @Context HttpHeaders headers, @Context HttpServletRequest request) throws WebApplicationException
    {

    	int viewType = Constants.MIN_VIEW;
    	
    	log.info("Reading item(id=" + itemId + ") metadata.");
        org.dspace.core.Context context = null;
        List<MetadataEntry> metadata = null;

        try
        {
            context = new org.dspace.core.Context();
            context.getDBConnection().setAutoCommit(true);
            org.dspace.content.Item dspaceItem = findItem(context, itemId, org.dspace.core.Constants.READ);

            metadata = new org.dspace.rtbf.rest.common.Sequence(viewType, dspaceItem, "metadata", context).getMetadataEntries();
            context.complete();
        }
        catch (SQLException e)
        {
            processException("Could not read item(id=" + itemId + "), SQLException. Message: " + e, context);
        }
        finally
        {
            processFinally(context);
        }

        log.trace("Item(id=" + itemId + ") metadata were successfully read.");
      return metadata.toArray(new MetadataEntry[0]);
    }




    /**
     * Find item from DSpace database. It is encapsulation of method
     * org.dspace.content.Item.find with checking if item exist and if user
     * logged into context has permission to do passed action.
     * 
     * @param context
     *            Context of actual logged user.
     * @param id
     *            Id of item in DSpace.
     * @param action
     *            Constant from org.dspace.core.Constants.
     * @return It returns DSpace item.
     * @throws WebApplicationException
     *             Is thrown when item with passed id is not exists and if user
     *             has no permission to do passed action.
     */
    private org.dspace.content.Item findItem(org.dspace.core.Context context, int id, int action) throws WebApplicationException
    {
        org.dspace.content.Item item = null;
        try
        {
            item = org.dspace.content.Item.find(context, id);

            if (item == null)
            {
                context.abort();
                log.warn("Item(id=" + id + ") was not found!");
                throw new WebApplicationException(Response.Status.NOT_FOUND);
            }

        }
        catch (SQLException e)
        {
            processException("Something get wrong while finding item(id=" + id + "). SQLException, Message: " + e, context);
        }
        return item;
    }
}
