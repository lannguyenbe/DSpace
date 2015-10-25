package org.dspace.rtbf.rest.common;

import org.apache.log4j.Logger;
import org.dspace.content.Community;
import org.dspace.content.ItemAdd;
import org.dspace.content.Metadatum;
import org.dspace.core.Context;

import javax.ws.rs.WebApplicationException;
import javax.xml.bind.annotation.XmlRootElement;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@XmlRootElement(name = "sequence")
public class Sequence extends DSpaceObject{
    private static Logger log = Logger.getLogger(Sequence.class);

    public Sequence() {}
    
    public Sequence(int viewType, org.dspace.content.Item item) {
    	super(viewType, item);
    }
    
    public Sequence(int viewType, org.dspace.content.Item item, String expand, Context context) throws SQLException, WebApplicationException {
    	this(viewType, item);
    	setup(viewType, item, expand, context);    	
    }
    
    private void setup(int viewType, org.dspace.content.Item item, String expand, Context context) throws SQLException {
    	int innerViewType = 0;
    	
    	switch(viewType) {
    	case SEARCH_RESULT_VIEW:
        	this.setCountSupports(getCountAllSupports(item));
            this.setFirstBroadcasted(getDateIssued(item));
    		innerViewType = MIN_VIEW;
    		break;
    	default:
    		innerViewType = viewType;
    	}

    	List<String> expandFields = new ArrayList<String>();
    	if (expand != null) {
    		expandFields = Arrays.asList(expand.split(","));
    	}

    	if(expandFields.contains("owningSerie") | expandFields.contains("all")) {
            org.dspace.content.Community parentCommunity = (org.dspace.content.Community) item.getOwningCollection().getParentObject();
            this.setOwningSerie(new Serie(innerViewType, parentCommunity, null, context));
        } else {
            this.addExpand("owningSerie");
        }
    	
        if(expandFields.contains("owningParentList") || expandFields.contains("all")) {
            this.owningParentList = new ArrayList<DSpaceObject>();

            org.dspace.content.Collection owningCollection = item.getOwningCollection();
            
            this.owningParentList.add(new Episode(innerViewType, owningCollection, null, context));
            org.dspace.content.Community parentCommunity = (org.dspace.content.Community) owningCollection.getParentObject();
            this.owningParentList.add(new Serie(innerViewType, parentCommunity, null, context));
            org.dspace.content.Community topparentCommunity = parentCommunity.getParentCommunity();
            if (topparentCommunity != null) { // already at top for orphan item
            	this.owningParentList.add(new Serie(innerViewType, topparentCommunity, null, context));
            }
        } else {
            this.addExpand("owningParentList");
        }

        if(expandFields.contains("owningEpisode") || expandFields.contains("all")) {
            this.owningEpisode = new Episode(innerViewType, item.getOwningCollection(), null, context);
        } else {
            this.addExpand("owningEpisode");
        }
    	
        if(expandFields.contains("parentEpisodeList") || expandFields.contains("all")) {
            this.parentEpisodeList = new ArrayList<Episode>();
            org.dspace.content.Collection[] collections = item.getCollections();
            for(org.dspace.content.Collection collection : collections) {
                this.parentEpisodeList.add(new Episode(innerViewType, collection, null, context));
            }
        } else {
            this.addExpand("parentEpisodeList");
        }
                
        if(expandFields.contains("metadata") || expandFields.contains("all")) {
    		metadataEntries = new ArrayList<MetadataEntry>();
            Metadatum[] dcvs = item.getMetadata(org.dspace.content.Item.ANY, org.dspace.content.Item.ANY, org.dspace.content.Item.ANY, org.dspace.content.Item.ANY);
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
