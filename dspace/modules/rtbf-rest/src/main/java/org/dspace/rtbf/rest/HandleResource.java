/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
package org.dspace.rtbf.rest;

import org.apache.log4j.Logger;
import org.dspace.authorize.AuthorizeManager;
import org.dspace.core.Constants;
import org.dspace.core.Context;
import org.dspace.handle.HandleManager;
import org.dspace.rtbf.rest.common.DSpaceObject;
import org.dspace.rtbf.rest.common.Episode;
import org.dspace.rtbf.rest.common.Sequence;
import org.dspace.rtbf.rest.common.Serie;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import java.sql.SQLException;

/**
 * Created with IntelliJ IDEA.
 * User: peterdietz
 * Date: 10/7/13
 * Time: 1:54 PM
 * To change this template use File | Settings | File Templates.
 */
@Path("/handle")
public class HandleResource {
    private static Logger log = Logger.getLogger(HandleResource.class);
    private static org.dspace.core.Context context;

    @GET
    @Path("/{prefix}/{suffix}")
    @Produces({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML})
    public org.dspace.rtbf.rest.common.DSpaceObject getObject(@PathParam("prefix") String prefix, @PathParam("suffix") String suffix
    			, @QueryParam("expand") String expand) {

    	int viewType = org.dspace.rtbf.rest.common.DSpaceObject.MIN_VIEW;

    	try {
            if(context == null || !context.isValid() ) {
                context = new Context();
                //Failed SQL is ignored as a failed SQL statement, prevent: current transaction is aborted, commands ignored until end of transaction block
                context.getDBConnection().setAutoCommit(true);
            }

            org.dspace.content.DSpaceObject dso = HandleManager.resolveToObject(context, prefix + "/" + suffix);
            if(dso == null) {
                throw new WebApplicationException(Response.Status.NOT_FOUND);
            }
            log.info("DSO Lookup by handle: [" + prefix + "] / [" + suffix + "] got result of: " + dso.getTypeText() + "_" + dso.getID());

            if(AuthorizeManager.authorizeActionBoolean(context, dso, org.dspace.core.Constants.READ)) {
                switch(dso.getType()) {
                    case Constants.COMMUNITY:
                        return new Serie(viewType, (org.dspace.content.Community) dso, expand+",owningSerie,metadata", context);
                    case Constants.COLLECTION:
                    	return new Episode(viewType, (org.dspace.content.Collection) dso, expand+",owningSerie,metadata", context);
                    case Constants.ITEM:
                        return new Sequence(viewType, (org.dspace.content.Item) dso, expand+",owningSerie,owningEpisode,parentEpisodeList,metadata", context);
                    default:
                        return new DSpaceObject(dso);
                }
            } else {
                throw new WebApplicationException(Response.Status.UNAUTHORIZED);
            }
        } catch (SQLException e) {
            log.error(e.getMessage());
            throw new WebApplicationException(Response.Status.INTERNAL_SERVER_ERROR);
        }
    }
}
