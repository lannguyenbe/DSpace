/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
package org.dspace.content;

import java.sql.SQLException;
import java.util.*;

import org.apache.commons.lang.ArrayUtils;
import org.apache.log4j.Logger;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.dspace.authorize.AuthorizeException;
import org.dspace.content.ItemAdd.DiffusionItem;
import org.dspace.content.authority.ChoiceAuthorityManager;
import org.dspace.content.authority.Choices;
import org.dspace.content.authority.MetadataAuthorityManager;
import org.dspace.core.Constants;
import org.dspace.core.Context;
import org.dspace.core.LogManager;
import org.dspace.eperson.EPerson;
import org.dspace.eperson.Group;
import org.dspace.event.Event;
import org.dspace.storage.rdbms.DatabaseManager;
import org.dspace.storage.rdbms.TableRow;
import org.dspace.storage.rdbms.TableRowIterator;
import org.dspace.handle.HandleManager;
import org.dspace.identifier.IdentifierService;
import org.dspace.utils.DSpace;

/**
 * Abstract base class for DSpace objects
 */
public abstract class Diffusion
{
    /** log4j category */
    private static final Logger log = Logger.getLogger(Diffusion.class);

    protected int community_id;
    protected int collection_id;
    protected int item_id;
	protected String diffusion_path;
	protected String date_event;
	protected String date_diffusion;
	protected String channel;

	
	public int getCommunity_id() {
		return community_id;
	}

	public int getCollection_id() {
		return collection_id;
	}

	public int getItem_id() {
		return item_id;
	}

	public String getDiffusion_path() {
		return diffusion_path;
	}

	public String getDate_event() {
		return date_event;
	}

	public String getDate_diffusion() {
		return date_diffusion;
	}

	public String getChannel() {
		return channel;
	}
	
}