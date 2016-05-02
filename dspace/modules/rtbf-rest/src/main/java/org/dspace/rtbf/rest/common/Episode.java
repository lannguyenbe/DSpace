/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
package org.dspace.rtbf.rest.common;

import org.apache.log4j.Logger;
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
public class Episode extends RTBObject {
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
    	int innerViewType = 0;
    	
    	switch (viewType) {
    	case Constants.SEARCH_RESULT_VIEW:
    		this.setDateIssued(getMetadataEntry(Constants.DATE_ISSUED,collection));
    		this.setChannelIssued(getMetadataEntry(Constants.CHANNEL_ISSUED,collection));
            // this.setCountSupports(getCountAllSupports(collection));
            this.setCountSequences(collection.countItems());
    		innerViewType = Constants.MIN_VIEW;
            break;
        default:
    		innerViewType = viewType;
        	break;
    	}

        List<String> expandFields = new ArrayList<String>();
        if(expand != null) {
            expandFields = Arrays.asList(expand.split(","));
        }
        
        if(expandFields.contains("owningSerie") | expandFields.contains("all")) {
            org.dspace.content.Community parentCommunity = (org.dspace.content.Community) collection.getParentObject();
            this.setOwningSerie(new Serie(innerViewType, parentCommunity, null, context));
        } else {
            this.addExpand("owningSerie");
        }

        if(expandFields.contains("owningParentList") || expandFields.contains("all")) {
            List<RTBObject> entries = new ArrayList<RTBObject>();
            // serie level
            org.dspace.content.Community parentCommunity = (org.dspace.content.Community) collection.getParentObject();
            entries.add(new Serie(innerViewType, parentCommunity, null, context));
            // repository level
            org.dspace.content.Community topparentCommunity = parentCommunity.getParentCommunity();
            if (topparentCommunity != null) { // already at top for orphan episode
            	entries.add(new Serie(innerViewType, topparentCommunity, null, context));
            }
            this.setOwningParentList(entries);
        } else {
            this.addExpand("owningParentList");
        }

        // Item paging : limit, offset/page
        if(expandFields.contains("sequences") || expandFields.contains("all")) {
            ItemIterator childItems;
            
            if (!((limit != null) && (limit >= 0) && (offset != null) && (offset >= 0))) {
                log.warn("Paging was badly set, using default values.");
                limit = Constants.LIMITMAX;
                offset = 0;
            }
            
            // Lan 02.05.2016 : order by date diffusion
            childItems = collection.getItemsOrderByDateDiffusion(limit, offset);
        	List<Sequence> entries = new ArrayList<Sequence>();
            while(childItems.hasNext()) {
                org.dspace.content.Item item = childItems.next();
                	// entries.add(new Sequence(innerViewType, item, null, context));
                	// Lan 02.05.2016 = with Constants.SEARCH_RESULT_VIEW to get date diffusion and channel
                	entries.add(new Sequence(Constants.SEARCH_RESULT_VIEW, item, null, context));
            }
            this.setSequences(entries);
        } else {
            this.addExpand("sequences");
        }

        if(expandFields.contains("metadata") || expandFields.contains("all")) {
        	List<MetadataEntry> entries = new ArrayList<MetadataEntry>();
        	Metadatum[] dcvs = collection.getMetadataByMetadataString("*.*.*");
            for (Metadatum dcv : dcvs) {
            	if (dcv.schema.equals(Constants.OLD_SCHEMA)) { continue; } // skip old schema
                entries.add(new MetadataEntry(dcv.getField(), dcv.value, dcv.language));
            }
            this.setMetadataEntries(entries);
     	} else {
     		this.addExpand("metadata");
     	}

        if(!expandFields.contains("all")) {
            this.addExpand("all");
        }
    }


}

