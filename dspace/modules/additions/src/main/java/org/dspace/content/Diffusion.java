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
public /* abstract */ class Diffusion
{
    /** log4j category */
    private static final Logger log = Logger.getLogger(Diffusion.class);


	private String channel;
	private String event_date;
    private String diffusion_datetime;
    private DSpaceObject dso;
    	

    public Diffusion(DSpaceObject dso, String event_date, String diffusion_date, String channel) {
    	this.channel = channel;
    	this.event_date = event_date;
    	this.diffusion_datetime = diffusion_date;
    	this.dso = dso;
   	
    }

	public String getChannel() {
		return channel;
	}

	public void setChannel(String channel) {
		this.channel = channel;
	}

	public String getEvent_date() {
		return event_date;
	}

	public void setEvent_date(String event_date) {
		this.event_date = event_date;
	}

	public String getDiffusion_datetime() {
		return diffusion_datetime;
	}

	public void setDiffusion_datetime(String diffusion_date) {
		this.diffusion_datetime = diffusion_date;
	}

	public DSpaceObject getDso() {
		return dso;
	}

	public void setDso(DSpaceObject dso) {
		this.dso = dso;
	}

}