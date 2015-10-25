/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
package org.dspace.rtbf.rest.common;

import org.apache.log4j.Logger;
import org.atteo.evo.inflector.English;
import org.dspace.content.Metadatum;
import org.dspace.core.Constants;
import org.dspace.rtbf.rest.search.SearchResponseParts;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlAnyElement;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

import java.util.ArrayList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: peterdietz
 * Date: 10/7/13
 * Time: 12:11 PM
 * To change this template use File | Settings | File Templates.
 */
@XmlRootElement(name = "dspaceobject")
public class DSpaceObject {
    // Type of view determine the choice of metadata to show 
    public static final int WITH_EXPANDELEM_VIEW = 1; // default
    public static final int MIN_VIEW = 2;
    public static final int SEARCH_RESULT_VIEW = 3;
    //
    public static final String[] TYPETEXT = { "none", "none", "SEQUENCE", "EPISODE", "SERIE", "none", "none", "none" };
    public static final int LIMITMAX = 5000;

    // Keys for accessing  metadata
    public static final String REPOSITORY = "rtbf.identifier.attributor";
    public static final String ROYALTY = "rtbf.royalty_code";
    public static final String ROYALTY_TEXT = "rtbf.royalty_remark";
    public static final String SHORT_DESCRIPTION = "dc.description.abstract";
    public static final String FIRST_BROADCASTED = "dc.date.issued";
    public static final String CODE_ORIGINE = "rtbf.code_origine.*";
    

    // MIN_VIEW Minimum Identification elements
    private Integer id;
    private String handle;
    private String type;
    private String title;

    // SEARCHRESULT_VIEW results basic elements
    //
    // Common metadata
    private String repository;
    private String royalty;
    private String royaltyText;
    private String shortDescription;
    private String thumbnail; // TODO
    //
    // Specialized metadata
    protected String firstBroadcasted;
    //
    // Calculated
    protected Integer countSubSeries;
    protected Integer countEpisodes;
	protected Integer countSequences;
    protected Integer countSupports;
    
    private String link;

    //Expandable relationships
    protected Serie owningSerie;
    protected List<DSpaceObject> owningParentList;
    protected Episode owningEpisode;
    protected List<Episode> parentEpisodeList;
    protected List<Serie> subSeries;
    protected List<Episode> episodes;
    protected List<Sequence> sequences;
    protected List<MetadataEntry> metadataEntries;
	protected MetadataWrapper metadata;
    // TODO List<Diffusion> diffusions;
    // TODO List<Support> supports;

    private ArrayList<String> expand = new ArrayList<String>();
	
	public DSpaceObject() {}

    public DSpaceObject(org.dspace.content.DSpaceObject dso) {
        setHandle(dso.getHandle());
        setType(TYPETEXT[dso.getType()].toLowerCase());
        setId(dso.getID());
        setTitle(dso.getName());
    }

    public DSpaceObject(int viewType, org.dspace.content.DSpaceObject dso) {
    	
    	this(dso);
    	
    	switch (viewType) {
    	case SEARCH_RESULT_VIEW:
    		disableExpand();
            setRepository(getDsoMetadata(REPOSITORY,dso));
            setRoyalty(getDsoMetadata(ROYALTY,dso));
            setRoyaltyText(getDsoMetadata(ROYALTY_TEXT,dso));
            setShortDescription(getDsoMetadata(SHORT_DESCRIPTION,dso));
    	case MIN_VIEW:
    		disableExpand();
    	}
    }
    
    protected String getDsoMetadata(String value, org.dspace.content.DSpaceObject dso){
        Metadatum[] dcvalues = dso.getMetadataByMetadataString(value);

        if(dcvalues.length>0) {
            return dcvalues[0].value;
        }
        return null;
    }
    
    protected Metadatum[] getAllMetadata(org.dspace.content.DSpaceObject dso){
        Metadatum[] dcvalues = dso.getMetadataByMetadataString("*.*.*");

        if(dcvalues.length>0) {
            return dcvalues;
        }
        return null;
    }

	protected String getDateIssued(org.dspace.content.DSpaceObject dso) {
		return getDsoMetadata(FIRST_BROADCASTED,dso);
	}

	protected int getCountAllSupports(org.dspace.content.DSpaceObject dso) {
		return(dso.getMetadataByMetadataString(CODE_ORIGINE).length);
	}

	@XmlAttribute
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitle(){
        return this.title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getHandle() {
        return handle;
    }

    public void setHandle(String handle) {
        this.handle = handle;
    }

    public String getLink() {
        //TODO, get actual contextPath of /rest/
        return "/RESTapi/" + English.plural(getType()) + "/" + getId();
    }

    public String getType() {
        return this.type;
    }

    public void setType(String type) {
        this.type = type;
    }


    public List<String> getExpand() {
        return expand;
    }

    public void setExpand(ArrayList<String> expand) {
        this.expand = expand;
    }

    public void addExpand(String expandableAttribute) {
    	if (this.expand != null) {
    		this.expand.add(expandableAttribute);
    	}
    }
    
    public void enableExpand() {
    	if (this.expand == null) {
    		expand = new ArrayList<String>();
    	}
    }

    public void disableExpand() {
    	this.expand = null;    	
    }
    
	public String getRepository() {
		return repository;
	}

	public void setRepository(String repository) {
		this.repository = repository;
	}

	public String getRoyalty() {
		return royalty;
	}

	public void setRoyalty(String royalty) {
		this.royalty = royalty;
	}

	public String getRoyaltyText() {
		return royaltyText;
	}

	public void setRoyaltyText(String royaltyText) {
		this.royaltyText = royaltyText;
	}

	public String getShortDescription() {
		return shortDescription;
	}

	public void setShortDescription(String shortDescription) {
		this.shortDescription = shortDescription;
	}

	public Serie getOwningSerie() {
		return owningSerie;
	}

	public void setOwningSerie(Serie parentSerie) {
		this.owningSerie = parentSerie;
	}

	@XmlElementWrapper( name = "subSeries")
	@XmlElement( name = "subSerie")
	public List<Serie> getSubSeries() {
		return subSeries;
	}

	public void setSubSeries(List<Serie> subSeries) {
		this.subSeries = subSeries;
	}

	@XmlElementWrapper( name = "episodes")
	@XmlElement( name = "episode")
	public List<Episode> getEpisodes() {
		return episodes;
	}

	public void setEpisodes(List<Episode> episodes) {
		this.episodes = episodes;
	}
    
    @XmlTransient
	public List<MetadataEntry> getMetadataEntries() {
		return metadataEntries;
	}
	
	public MetadataWrapper getMetadata() {
		if (metadataEntries != null ) {
			metadata = new MetadataWrapper(metadataEntries);
		}
		return metadata;
	}

	public void setMetadata(MetadataWrapper wrapper) {
		this.metadata = wrapper;
	}

	public Integer getCountSubSeries() {
		return countSubSeries;
	}

	public void setCountSubSeries(Integer countSubSeries) {
		this.countSubSeries = countSubSeries;
	}

	public Integer getCountEpisodes() {
		return countEpisodes;
	}

	public void setCountEpisodes(Integer countEpisodes) {
		this.countEpisodes = countEpisodes;
	}

	public Integer getCountSequences() {
		return countSequences;
	}

	public void setCountSequences(Integer countSequences) {
		this.countSequences = countSequences;
	}

	@XmlElementWrapper( name = "sequences")
	@XmlElement( name = "sequence")
	public List<Sequence> getSequences() {
		return sequences;
	}

	public void setSequences(List<Sequence> sequences) {
		this.sequences = sequences;
	}

	public String getFirstBroadcasted() {
		return firstBroadcasted;
	}

	public void setFirstBroadcasted(String firstBroadcasted) {
		this.firstBroadcasted = firstBroadcasted;
	}

	public Integer getCountSupports() {
		return countSupports;
	}

	public void setCountSupports(Integer countSupports) {
		this.countSupports = countSupports;
	}

	public Episode getOwningEpisode() {
		return owningEpisode;
	}

	public void setOwningEpisode(Episode owningEpisode) {
		this.owningEpisode = owningEpisode;
	}

	@XmlElementWrapper( name = "parentEpisodeList")
	@XmlElement( name = "parentEpisode")
	public List<Episode> getParentEpisodeList() {
		return parentEpisodeList;
	}

	public void setParentEpisodeList(List<Episode> parentEpisodeList) {
		this.parentEpisodeList = parentEpisodeList;
	}

	public String getThumbnail() {
		return thumbnail;
	}

	public void setThumbnail(String thumbnail) {
		this.thumbnail = thumbnail;
	}

	@XmlElementWrapper( name = "owningParentList")
	@XmlElement( name = "owningParent")
	public List<DSpaceObject> getOwningParentList() {
		return owningParentList;
	}

	public void setOwningParentList(List<DSpaceObject> parentsList) {
		this.owningParentList = parentsList;
	}
}
