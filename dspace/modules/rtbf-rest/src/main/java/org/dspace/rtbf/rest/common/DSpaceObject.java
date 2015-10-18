/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
package org.dspace.rtbf.rest.common;

import org.atteo.evo.inflector.English;
import org.dspace.content.Metadatum;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

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
    // Type of view determining minimum metadata for the element
    public static final int MIN_VIEW = 0;
    public static final int BASIC_VIEW = 1;

    // Keys for accessing  metadata
    public static final String REPOSITORY = "rtbf.identifier.attributor";
    public static final String ROYALTY = "rtbf.royalty_code";
    public static final String ROYALTY_TEXT = "rtbf.royalty_remark";
    public static final String SHORT_DESCRIPTION = "dc.description.abstract";

    // Common elements
    private Integer id;

    private String name;
    private String handle;
    private String type;

    private String repository;
    private String royalty;
    private String royaltyText;
    private String shortDescription;
    
    
    @XmlElement(name = "link", required = true)
    private String link;

    @XmlElement(required = true)
    private ArrayList<String> expand = new ArrayList<String>();

    //Expandable relationships
    protected Serie parentSerie;
    protected List<Serie> parentSerieList;
    protected Episode parentEpisode;
    protected List<Episode> parentEpisodeList;
    protected List<Serie> subSeries;
    protected List<Episode> episodes;
    protected List<Sequence> sequences;
    // TODO List<Diffusion> diffusions;
    // TODO List<Support> supports;

    //others metadata
    protected List<MetadataEntry> metadata;
    protected String firstBroadcasted;
    protected String lastModified;

    //Calculated
    protected Integer countSubSeries;
    protected Integer countEpisodes;
	protected Integer countSequences;
    protected Integer countSupports;

	
	public DSpaceObject() {

    }

    public DSpaceObject(org.dspace.content.DSpaceObject dso) {
        setId(dso.getID());
        setName(dso.getName());
        setHandle(dso.getHandle());
        setType(dso.getTypeText().toLowerCase());
    }

    public DSpaceObject(org.dspace.content.DSpaceObject dso, int viewType) {
    	
    	this(dso);
    	
    	switch (viewType) {
    	case BASIC_VIEW:
    	default:
            setRepository(getDsoMetadata(REPOSITORY,dso));
            setRoyalty(getDsoMetadata(ROYALTY,dso));
            setRoyaltyText(getDsoMetadata(ROYALTY_TEXT,dso));
            setShortDescription(getDsoMetadata(SHORT_DESCRIPTION,dso));
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

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName(){
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
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
        this.expand.add(expandableAttribute);
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

	// Lan
	public Serie getParentSerie() {
		return parentSerie;
	}

	public void setParentSerie(Serie parentSerie) {
		this.parentSerie = parentSerie;
	}

	public List<Serie> getSubSeries() {
		return subSeries;
	}

	public void setSubSeries(List<Serie> subSeries) {
		this.subSeries = subSeries;
	}

	public List<Episode> getEpisodes() {
		return episodes;
	}

	public void setEpisodes(List<Episode> episodes) {
		this.episodes = episodes;
	}

	public List<MetadataEntry> getMetadata() {
		return metadata;
	}

	public void setMetadata(List<MetadataEntry> metadata) {
		this.metadata = metadata;
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
// Lan 2
	public List<Serie> getParentSerieList() {
		return parentSerieList;
	}

	public void setParentSerieList(List<Serie> parentSerieList) {
		this.parentSerieList = parentSerieList;
	}

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

	public String getLastModified() {
		return lastModified;
	}

	public void setLastModified(String lastModified) {
		this.lastModified = lastModified;
	}

	public Integer getCountSupports() {
		return countSupports;
	}

	public void setCountSupports(Integer countSupports) {
		this.countSupports = countSupports;
	}
// Lan 3
	public Episode getParentEpisode() {
		return parentEpisode;
	}

	public void setParentEpisode(Episode parentEpisode) {
		this.parentEpisode = parentEpisode;
	}

	public List<Episode> getParentEpisodeList() {
		return parentEpisodeList;
	}

	public void setParentEpisodeList(List<Episode> parentEpisodeList) {
		this.parentEpisodeList = parentEpisodeList;
	}
}
