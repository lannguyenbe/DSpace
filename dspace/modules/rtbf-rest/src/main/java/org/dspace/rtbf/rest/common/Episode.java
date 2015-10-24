/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
package org.dspace.rtbf.rest.common;

import org.apache.log4j.Logger;
import org.dspace.content.Collection;
import org.dspace.content.ItemIterator;
import org.dspace.content.Metadatum;
import org.dspace.core.Context;

import javax.ws.rs.WebApplicationException;
import javax.xml.bind.annotation.XmlRootElement;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@XmlRootElement(name = "episode")
public class Episode extends DSpaceObject {
	Logger log = Logger.getLogger(Episode.class);

	public Episode(){}
	
    public Episode(int viewType, org.dspace.content.Collection collection, String expand, Context context, Integer limit, Integer offset) 
    		throws SQLException, WebApplicationException
    {
        super(viewType, collection);
        setup(viewType, collection, expand, context, limit, offset);
    }

    public Episode(int viewType, org.dspace.content.Collection collection, String expand, Context context)
    		throws SQLException, WebApplicationException
    {
		this(viewType, collection, expand, context, null, null);
	}

    private void setup(int viewType, org.dspace.content.Collection collection, String expand, Context context, Integer limit, Integer offset) throws SQLException{
    	
    	switch (viewType) {
    	case SEARCH_RESULT_VIEW:
        	this.setFirstBroadcasted(getDateIssued(collection));
            this.setCountSupports(getCountAllSupports(collection));
            this.setCountSequences(collection.countItems());
            break;
    	}

        List<String> expandFields = new ArrayList<String>();
        if(expand != null) {
            expandFields = Arrays.asList(expand.split(","));
        }
        
        if(expandFields.contains("parentSerie") | expandFields.contains("all")) {
            org.dspace.content.Community parentCommunity = (org.dspace.content.Community) collection.getParentObject();
            this.setParentSerie(new Serie(viewType, parentCommunity, null, context));
        } else {
            this.addExpand("parentSerie");
        }

        //Item paging : limit, offset/page
        if(expandFields.contains("sequences") || expandFields.contains("all")) {
            ItemIterator childItems;
            
            if (!((limit != null) && (limit >= 0) && (offset != null) && (offset >= 0))) {
                log.warn("Pagging was badly set, using default values.");
                limit = LIMITMAX;
                offset = 0;
            }
            
            childItems = collection.getItems(limit, offset);
            sequences = new ArrayList<Sequence>();
            while(childItems.hasNext()) {
                org.dspace.content.Item item = childItems.next();
                	sequences.add(new Sequence(viewType, item, null, context));
            }
        } else {
            this.addExpand("sequences");
        }

        if(expandFields.contains("metadata") || expandFields.contains("all")) {
    		metadataEntries = new ArrayList<MetadataEntry>();
            Metadatum[] dcvs = getAllMetadata(collection);
            for (Metadatum dcv : dcvs) {
                metadataEntries.add(new MetadataEntry(dcv.getField(), dcv.value, dcv.language));
            }
     	} else {
     		this.addExpand("metadata");
     	}

        if(!expandFields.contains("all")) {
            this.addExpand("all");
        }
    }


}

