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
import org.dspace.content.CollectionAdd;
import org.dspace.content.Community;
import org.dspace.content.ItemAdd;
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
    		this.setChannelIssued(getMetadataEntries(Constants.CHANNEL_ISSUED,collection));
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
            /* 
             * Lan 22.06.2016 : return more metadata of the owningSerie - see Constants.OWNING_SERIE_EXPAND_OPTIONS
             * this.setOwningSerie(new Serie(innerViewType, parentCommunity, null, context));
             */
              this.setOwningSerie(new Serie(innerViewType, parentCommunity, Constants.OWNING_SERIE_EXPAND_OPTIONS, context));
        } else {
            this.addExpand("owningSerie");
        }

        if(expandFields.contains("owningParentList") || expandFields.contains("all")) {
            this.setOwningParentList(findOwningParentList(context, collection));
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
                	// Lan 02.05.2016 = with Constants.PLAYLIST_VIEW to get date diffusion and channel
                	entries.add(new Sequence(Constants.PLAYLIST_VIEW, item, null, context));
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

        if(expandFields.contains("diffusions") || expandFields.contains("all")) {
        	List<RTBObjectParts.Diffusion> diffusionList = new ArrayList<RTBObjectParts.Diffusion>();
        	org.dspace.content.Diffusion[] diffs = CollectionAdd.DiffusionCollection.findById(context, collection.getID());
        	for (org.dspace.content.Diffusion diff : diffs) {
        		diffusionList.add(new RTBObjectParts.Diffusion(diff.getChannel(), diff.getDate_diffusion()
        				, findOwningParentList(context, collection)));
            }
            
            this.setDiffusions(diffusionList);
     	} else {
     		this.addExpand("metadata");
     	}

        if(expandFields.contains("supports") || expandFields.contains("all")) {
        	List<RTBObjectParts.Support> supportList = new ArrayList<RTBObjectParts.Support>();
        	org.dspace.content.Support[] supports = CollectionAdd.SupportCollection.findById(context, collection.getID());
        	for (org.dspace.content.Support supp : supports) {
        		supportList.add(new RTBObjectParts.Support(supp));
            }
            
            this.setSupports(supportList);
     	} else {
     		this.addExpand("supports");
     	}

        if(!expandFields.contains("all")) {
            this.addExpand("all");
        }
    }

    private List<RTBObject> findOwningParentList(Context context, org.dspace.content.Collection owningCollection) throws WebApplicationException, SQLException{
    	int innerViewType = Constants.MIN_VIEW;
        List<RTBObject> entries = new ArrayList<RTBObject>();
       // serie level
        org.dspace.content.Community parentCommunity = (org.dspace.content.Community) owningCollection.getParentObject();
        entries.add(new Serie(innerViewType, parentCommunity, null, context));
        // repository level
        org.dspace.content.Community topparentCommunity = parentCommunity.getParentCommunity();
        entries.add(new Serie(innerViewType, topparentCommunity, null, context));
		return entries;   	
    }
    		                    
    

}

