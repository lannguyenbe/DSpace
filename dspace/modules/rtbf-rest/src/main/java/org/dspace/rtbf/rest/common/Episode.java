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
public class Episode extends DSpaceObject {
	Logger log = Logger.getLogger(Episode.class);

	public Episode(){}

    public Episode(org.dspace.content.Collection collection, String expand, Context context, Integer limit, Integer offset) throws SQLException, WebApplicationException{
        super(collection, BASIC_VIEW);
        setup(collection, expand, context, limit, offset);
    }

    private void setup(org.dspace.content.Collection collection, String expand, Context context, Integer limit, Integer offset) throws SQLException{

    	this.setFirstBroadcasted(getDateIssued(collection));
        this.setCountSupports(getAllSupports(collection));
        this.setCountSequences(collection.countItems());

        List<String> expandFields = new ArrayList<String>();
        if(expand != null) {
            expandFields = Arrays.asList(expand.split(","));
        }
        
        if(expandFields.contains("parentSerieList") || expandFields.contains("all")) {
            this.parentSerieList = new ArrayList<Serie>();
            org.dspace.content.Community[] parentCommunities = collection.getCommunities();
            for(org.dspace.content.Community parentCommunity : parentCommunities) {
                this.parentSerieList.add(new Serie(parentCommunity, null, context));
            }
        } else {
            this.addExpand("parentSerieList");
        }

        if(expandFields.contains("parentSerie") | expandFields.contains("all")) {
            org.dspace.content.Community parentCommunity = (org.dspace.content.Community) collection.getParentObject();
            this.setParentSerie(new Serie(parentCommunity, null, context));
        } else {
            this.addExpand("parentSerie");
        }

        //Item paging : limit, offset/page
        if(expandFields.contains("sequences") || expandFields.contains("all")) {
            ItemIterator childItems;
            if(limit != null && limit >= 0 ) {
            	if (offset != null && offset >= 0) {
                    childItems = collection.getItems(limit, offset);
            	} else {
            		childItems = collection.getItems(limit, 0);
            	}
            } else {
                childItems = collection.getItems();
            }

            sequences = new ArrayList<Sequence>();
            while(childItems.hasNext()) {
                org.dspace.content.Item item = childItems.next();
                	sequences.add(new Sequence(item, null, context));
            }
        } else {
            this.addExpand("sequences");
        }

        if(expandFields.contains("metadata") || expandFields.contains("all")) {
    		metadata = new ArrayList<MetadataEntry>();
            Metadatum[] dcvs = getAllMetadata(collection);
            for (Metadatum dcv : dcvs) {
                metadata.add(new MetadataEntry(dcv.getField(), dcv.value, dcv.language));
            }
     	} else {
     		this.addExpand("metadata");
     	}

        if(!expandFields.contains("all")) {
            this.addExpand("all");
        }
    }

	private String getDateIssued(org.dspace.content.DSpaceObject dso) {
		return getDsoMetadata("dc.date.issued",dso);
	}

	private int getAllSupports(org.dspace.content.DSpaceObject dso) {
		return(dso.getMetadataByMetadataString("rtbf.code_origine.*").length);
	}

}

