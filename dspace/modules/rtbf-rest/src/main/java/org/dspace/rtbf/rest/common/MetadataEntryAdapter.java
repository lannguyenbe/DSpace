package org.dspace.rtbf.rest.common;

import java.util.Properties;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.adapters.XmlAdapter;

import org.dspace.rtbf.rest.util.RsConfigurationManager;

/*
 * Use only by Jabx for xml output
 */
public class MetadataEntryAdapter extends XmlAdapter<JAXBElement<String>, MetadataEntry> {

	@Override
	public MetadataEntry unmarshal(JAXBElement<String> v) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public JAXBElement<String> marshal(MetadataEntry entry) throws Exception {
		if (entry == null) { return null; }
		return(new JAXBElement<String>(
				new javax.xml.namespace.QName(getPreferredLabel(entry.getKey()))
				, String.class
				, entry.getValue()
		));
	}

	private String getPreferredLabel(String key) { 
    	String label = ((Properties) RsConfigurationManager.getInstance().getAttribute(Constants.NAMINGMETA)).getProperty(key);
    	return ((label != null)? label : key);
	}

}
