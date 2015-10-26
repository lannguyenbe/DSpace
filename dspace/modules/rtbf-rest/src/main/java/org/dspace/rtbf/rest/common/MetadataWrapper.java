package org.dspace.rtbf.rest.common;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlAnyElement;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

import org.apache.log4j.Logger;
import org.dspace.rtbf.rest.search.SearchResponseParts;

public class MetadataWrapper {
    private static Logger log = Logger.getLogger(MetadataWrapper.class);

    protected List<MetadataEntry> metadataEntries;

	protected List<JAXBElement<String>> elements;

	public MetadataWrapper() {}
	
    public MetadataWrapper(List<MetadataEntry> entries) {
    	this.metadataEntries = entries;
    }
    

    @XmlAnyElement
    public List<JAXBElement<String>> getMetadata() {
    	List<MetadataEntry> v = metadataEntries;
		List<JAXBElement<String>> elements = new ArrayList<JAXBElement<String>>();
		
		for (MetadataEntry entry : v) {
			elements.add(new JAXBElement<String>(
					new javax.xml.namespace.QName(entry.getKey())
//					new javax.xml.namespace.QName(getPreferredLabel(entry.getKey()))
					, String.class
					, entry.getValue()
			));
			
		}
          return elements;
    }
    

	private String getPreferredLabel(String key) { // strip schema part of the metadata name, concat the other parts with "_"
		StringBuilder label = new StringBuilder();
		String keyParts[] = key.split("\\.");
		for (int i = 1, len = keyParts.length; i < len; i++) {
			if (i > 1) {
				label.append("_");
			}
			label.append(keyParts[i]);
		}

		return label.toString();
	}

}
