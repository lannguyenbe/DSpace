package org.dspace.rtbf.rest.common;

import org.apache.log4j.Logger;
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
    
    public Sequence(org.dspace.content.Item item, String expand, Context context) throws SQLException, WebApplicationException {
    	super(item, BASIC_VIEW);
    	setup(item, expand, context);    	
    }
    
    private void setup(org.dspace.content.Item item, String expand, Context context) throws SQLException {
    	this.setCountSupports(getAllSupports(item));
    	this.setLastModified(item.getLastModified().toString());
        this.setFirstBroadcasted(getDateIssued(item));
        
        List<String> expandFields = new ArrayList<String>();
    	if (expand != null) {
    		expandFields = Arrays.asList(expand.split(","));
    	}
    	
        if(expandFields.contains("parentEpisode") || expandFields.contains("all")) {
            this.parentEpisode = new Episode(item.getOwningCollection(), null, context, null, null);
        } else {
            this.addExpand("parentEpisode");
        }
    	
        if(expandFields.contains("parentEpisodeList") || expandFields.contains("all")) {
            this.parentEpisodeList = new ArrayList<Episode>();
            org.dspace.content.Collection[] collections = item.getCollections();
            for(org.dspace.content.Collection collection : collections) {
                this.parentEpisodeList.add(new Episode(collection, null, context, null, null));
            }
        } else {
            this.addExpand("parentEpisodeList");
        }
        
        if(expandFields.contains("parentSerieList") || expandFields.contains("all")) {
            this.parentSerieList = new ArrayList<Serie>();
            org.dspace.content.Community[] communities = item.getCommunities();
            for(org.dspace.content.Community community : communities) {
                this.parentSerieList.add(new Serie(community, null, context));
            }
        } else {
            this.addExpand("parentSerieList");
        }
        
        if(expandFields.contains("metadata") || expandFields.contains("all")) {
    		metadata = new ArrayList<MetadataEntry>();
            Metadatum[] dcvs = item.getMetadata(org.dspace.content.Item.ANY, org.dspace.content.Item.ANY, org.dspace.content.Item.ANY, org.dspace.content.Item.ANY);
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
