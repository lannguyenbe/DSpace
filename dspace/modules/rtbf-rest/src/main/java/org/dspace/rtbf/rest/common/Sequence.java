package org.dspace.rtbf.rest.common;

import org.apache.log4j.Logger;
import org.dspace.content.Metadatum;
import org.dspace.core.Context;
import org.dspace.discovery.DiscoverExpandedItems;
import org.dspace.discovery.DiscoverResult;
import org.dspace.discovery.DiscoverResult.SearchDocument;

import javax.ws.rs.WebApplicationException;
import javax.xml.bind.annotation.XmlRootElement;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@XmlRootElement(name = "sequence")
public class Sequence extends RTBObject{
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
    	case Constants.SEARCH_RESULT_VIEW:
    		this.setDateIssued(getMetadataEntry(Constants.DATE_ISSUED,item));
    		this.setChannelIssued(getMetadataEntry(Constants.CHANNEL_ISSUED,item));
        	// this.setCountSupports(getCountAllSupports(item));
    		innerViewType = Constants.MIN_VIEW;
    		break;
    	case Constants.STANDARD_VIEW:
            // Add linked Documents : collapse on identifier_origin
            List<RTBObject> linkedDocuments = new ArrayList<RTBObject>();	                    
            DiscoverExpandedItems expandedItems = new DiscoverExpandedItems(context, item);
            List<DiscoverResult.SearchDocument> entries = expandedItems.getItems();
    		for (SearchDocument entry : entries) {
    			linkedDocuments.add(new RTBObject(entry.getSearchFields().get("handle").get(0)));
    		}
    		if (linkedDocuments.size() > 0) {
    			this.setLinkedDocuments(linkedDocuments);
    		}
    		innerViewType = Constants.MIN_VIEW;
    		break;
    	default:
    		innerViewType = viewType;
    	}

    	List<String> expandFields = new ArrayList<String>();
    	if (expand != null) {
    		expandFields = Arrays.asList(expand.split(","));
    	}

    	if(expandFields.contains("owningSerie") || expandFields.contains("all")) {
            org.dspace.content.Community parentCommunity = (org.dspace.content.Community) item.getOwningCollection().getParentObject();
            this.setOwningSerie(new Serie(innerViewType, parentCommunity, null, context));
        } else {
            this.addExpand("owningSerie");
        }
    	
        if(expandFields.contains("owningParentList") || expandFields.contains("all")) {
            List<RTBObject> entries = new ArrayList<RTBObject>();

            org.dspace.content.Collection owningCollection = item.getOwningCollection();
            
            entries.add(new Episode(innerViewType, owningCollection, null, context));
            org.dspace.content.Community parentCommunity = (org.dspace.content.Community) owningCollection.getParentObject();
            entries.add(new Serie(innerViewType, parentCommunity, null, context));
            org.dspace.content.Community topparentCommunity = parentCommunity.getParentCommunity();
            if (topparentCommunity != null) { // already at top for orphan item
            	entries.add(new Serie(innerViewType, topparentCommunity, null, context));
            }
            this.setOwningParentList(entries);
        } else {
            this.addExpand("owningParentList");
        }

        if(expandFields.contains("owningEpisode") || expandFields.contains("all")) {
        	this.setOwningEpisode(new Episode(innerViewType, item.getOwningCollection(), null, context));
        } else {
            this.addExpand("owningEpisode");
        }
    	
        if(expandFields.contains("parentEpisodeList") || expandFields.contains("all")) {
        	List<Episode> entries = new ArrayList<Episode>();
            org.dspace.content.Collection[] collections = item.getCollections();
            for(org.dspace.content.Collection collection : collections) {
                entries.add(new Episode(innerViewType, collection, null, context));
            }
            this.setParentEpisodeList(entries);
        } else {
            this.addExpand("parentEpisodeList");
        }
                
        if(expandFields.contains("metadata") || expandFields.contains("all")) {
        	List<MetadataEntry> entries = new ArrayList<MetadataEntry>();
            Metadatum[] dcvs = item.getMetadata(org.dspace.content.Item.ANY, org.dspace.content.Item.ANY, org.dspace.content.Item.ANY, org.dspace.content.Item.ANY);
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
