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
    private static Logger log = Logger.getLogger(DSpaceObject.class);
    
    // MIN_VIEW Minimum Identification elements
    private Integer id;
    private String handle;
    private String type;
    private MetadataEntry title;

    // SEARCHRESULT_VIEW results basic elements
    //
    // Common metadata
    private MetadataEntry identifier_attributor;
    private MetadataEntry royalty_code;
    private MetadataEntry royalty_remark;
    private MetadataEntry description_abstract;
    private String thumbnail; // TODO
    //
    // Specialized metadata
    private MetadataEntry dateIssued;
    //
    // Calculated
    protected Integer countSubSeries;
    protected Integer countEpisodes;
	protected Integer countSequences;
    protected Integer countSupports;
    
    @XmlElement(name = "link", required = true)
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
    		setIdentifier_attributor(getMetadataEntry(Constants.ATTRIBUTOR,dso));
            setRoyalty_code(getMetadataEntry(Constants.ROYALTY,dso));
            setRoyalty_remark(getMetadataEntry(Constants.ROYALTY_REMARK,dso));
            setDescription_abstract(getMetadataEntry(Constants.ABSTRACT,dso));
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

//	@XmlJavaTypeAdapter(MetadataEntryAdapter.class)
//  @XmlAnyElement
    public MetadataEntry getTitle(){
        return this.title;
    }

    public void setTitle(MetadataEntry title) {
        this.title = title;
    }

    public String getLink() {
        //TODO, get actual contextPath of /rest/
        return "/RESTapi/" + English.plural(getType()) + "/" + getId();
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
   
//  @XmlJavaTypeAdapter(MetadataEntryAdapter.class)
//  @XmlAnyElement
	public MetadataEntry getRoyalty_code() {
		return royalty_code;
	}

	public void setRoyalty_code(MetadataEntry royalty) {
		this.royalty_code = royalty;
	}

//	@XmlJavaTypeAdapter(MetadataEntryAdapter.class)
//  @XmlAnyElement
	public MetadataEntry getRoyalty_remark() {
		return royalty_remark;
	}

	public void setRoyalty_remark(MetadataEntry royaltyText) {
		this.royalty_remark = royaltyText;
	}

//	@XmlJavaTypeAdapter(MetadataEntryAdapter.class)
//  @XmlAnyElement
	public MetadataEntry getDescription_abstract() {
		return description_abstract;
	}

	public void setDescription_abstract(MetadataEntry description) {
		this.description_abstract = description;
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

	@XmlJavaTypeAdapter(MetadataEntryAdapter.class)
//	@XmlAnyElement
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

//	@XmlJavaTypeAdapter(MetadataEntryAdapter.class)
//  @XmlAnyElement
	public MetadataEntry getIdentifier_attributor() {
		return identifier_attributor;
	}

	public void setIdentifier_attributor(MetadataEntry identifier_attributor) {
		this.identifier_attributor = identifier_attributor;
	}


}
