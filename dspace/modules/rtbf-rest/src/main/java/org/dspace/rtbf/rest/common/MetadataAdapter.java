package org.dspace.rtbf.rest.common;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.adapters.XmlAdapter;

import org.mortbay.log.Log;


public class MetadataAdapter extends XmlAdapter<MetadataWrapper, List<MetadataEntry>> {

	@Override
	public List<MetadataEntry> unmarshal(MetadataWrapper v) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public MetadataWrapper marshal(List<MetadataEntry> v) throws Exception {
		if (v == null) {
			return null;
		}
		
		MetadataWrapper wrapper = new MetadataWrapper();
		List<JAXBElement<String>> elements = new ArrayList<JAXBElement<String>>();
				
		for (MetadataEntry entry : v) {
			elements.add(new JAXBElement<String>(
					new javax.xml.namespace.QName(getPreferredLabel(entry.getKey()))
					, String.class
					, entry.getValue()
			));
			
		}
		
		wrapper.elements = elements;
		return wrapper;
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
