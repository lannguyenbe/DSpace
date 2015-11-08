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
import org.dspace.rtbf.rest.common.Constants;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import javax.xml.bind.annotation.XmlAnyElement;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlTransient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 * User: peterdietz
 * Date: 10/7/13
 * Time: 12:11 PM
 * To change this template use File | Settings | File Templates.
 */
@XmlRootElement(name = "dspaceobject")
public class DSpaceObject {
    private static Logger log = Logger.getLogger(DSpaceObject.class);
    
    // MIN_VIEW minimum Identification elements
    private Integer id;
    private String handle;
    private String type;
    private MetadataEntry title;

    // SEARCH_RESULT_VIEW results basic elements
    //
    // Common elements
    @JsonProperty("rtbf.identifier.attributor")
    private MetadataEntry identifierAttributor;
    @JsonProperty("rtbf.royalty_code")
    private MetadataEntry royaltyCode;
    @JsonProperty("rtbf.royalty_remark")
    private MetadataEntry royaltyRemark;
    @JsonProperty("dc.description.abstract")
    private MetadataEntry descriptionAbstract;
    private String thumbnail; // TODO
    //
    // Specialized elements
    @JsonProperty("dc.date.issued")
    private MetadataEntry dateIssued;
	//
    // Calculated elements
    protected Integer countSubSeries;
    protected Integer countEpisodes;
	protected Integer countSequences;
    protected Integer countSupports;
    
//    @XmlElement(name = "link", required = true)
    private String link;

    //Expandable relationships
    protected Serie owningSerie;
    protected List<DSpaceObject> owningParentList;
    protected Episode owningEpisode;
    protected List<Episode> parentEpisodeList;
    protected List<Serie> subSeries;
    protected List<Episode> episodes;
    protected List<Sequence> sequences;
    @JsonIgnore
    protected List<MetadataEntry> metadataEntries; // neither by Jaxb, nor Jackson
    @JsonIgnore
    protected MetadataWrapper metadata; // use by Jaxb, not by Jackson
    // TODO List<Diffusion> diffusions;
    // TODO List<Support> supports;

    @XmlElement(required = true)
    private ArrayList<String> expand = new ArrayList<String>();
	
	public DSpaceObject() {}

    public DSpaceObject(org.dspace.content.DSpaceObject dso) {
        setHandle(dso.getHandle());
        setType(Constants.TYPETEXT[dso.getType()].toLowerCase());
        setId(dso.getID());
        setTitle(getMetadataEntry(Constants.TITLE,dso));
    }

    public DSpaceObject(int viewType, org.dspace.content.DSpaceObject dso) {
    	
    	this(dso);
    	
    	switch (viewType) {
    	case Constants.SEARCH_RESULT_VIEW:
    		disableExpand();
    		setIdentifierAttributor(getMetadataEntry(Constants.ATTRIBUTOR,dso));
            setRoyaltyCode(getMetadataEntry(Constants.ROYALTY,dso));
            setRoyaltyRemark(getMetadataEntry(Constants.ROYALTY_REMARK,dso));
            setDescriptionAbstract(getMetadataEntry(Constants.ABSTRACT,dso));
            break;
    	case Constants.MIN_VIEW:
    		disableExpand();
    		break;
    	case Constants.EXPANDELEM_VIEW:
    		enableExpand();
    	}
    }
    
    protected MetadataEntry getMetadataEntry(String value, org.dspace.content.DSpaceObject dso){
        Metadatum[] dcv = dso.getMetadataByMetadataString(value);

        if(dcv.length>0) {
            return new MetadataEntry(dcv[0].getField(), dcv[0].value, dcv[0].language);
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

	protected int getCountAllSupports(org.dspace.content.DSpaceObject dso) {
		return(dso.getMetadataByMetadataString(Constants.CODE_ORIGINE).length);
	}

	@XmlAttribute
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getType() {
        return this.type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getHandle() {
        return handle;
    }

    public void setHandle(String handle) {
        this.handle = handle;
    }

    @XmlAnyElement
    public MetadataEntry getTitle(){
        return this.title;
    }

    public void setTitle(MetadataEntry title) {
        this.title = title;
    }

    @XmlTransient
    @JsonIgnore
    public String getLink() {
        //TODO, get actual contextPath of /rest/
        return "/RESTapi/" + English.plural(getType()) + "/" + getId();
    }

    public void setLink(String link) {
    	this.link = link;
    }

    public List<String> getExpand() {
        return expand;
    }

    public void setExpand(ArrayList<String> expand) {
        this.expand = expand;
    }

    public void addExpand(String expandableAttribute) {
    	if (this.expand != null) {
    		log.info("debug 600 :"+ this.expand.size());
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
   
    @XmlAnyElement
	public MetadataEntry getRoyaltyCode() {
		return royaltyCode;
	}

	public void setRoyaltyCode(MetadataEntry royalty) {
		this.royaltyCode = royalty;
	}

	@XmlAnyElement
	public MetadataEntry getRoyaltyRemark() {
		return royaltyRemark;
	}

	public void setRoyaltyRemark(MetadataEntry royaltyText) {
		this.royaltyRemark = royaltyText;
	}

	@XmlAnyElement
	public MetadataEntry getDescriptionAbstract() {
		return descriptionAbstract;
	}

	public void setDescriptionAbstract(MetadataEntry description) {
		this.descriptionAbstract = description;
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
    
	@JsonIgnore
	@XmlTransient
	public List<MetadataEntry> getMetadataEntries() { // neither by Jaxb, nor Jackson
		return metadataEntries;
	}
	
    @JsonIgnore
	public MetadataWrapper getMetadata() { // use by Jaxb, not by Jackson
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

	@XmlAnyElement
	public MetadataEntry getDateIssued() {
		return dateIssued;
	}
	
	public void setDateIssued(MetadataEntry dateIssued) {
		this.dateIssued = dateIssued;
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

	@XmlAnyElement
	public MetadataEntry getIdentifierAttributor() {
		return identifierAttributor;
	}

	public void setIdentifierAttributor(MetadataEntry m) {
		this.identifierAttributor = m;
	}

	@JsonGetter("metadata")
	@XmlTransient
	protected Map<String, Object> getMetadataEntriesAsMap() { // use by Jackson, not by Jaxb
		return MetadataEntry.listAsMap(this.metadataEntries);
	}

}
