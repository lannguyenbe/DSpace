package org.dspace.rtbf.rest.common;

import java.util.Properties;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.adapters.XmlAdapter;

import org.apache.log4j.Logger;
import org.dspace.rtbf.rest.util.RsConfigurationManager;

public class MetadataEntryAdapter extends XmlAdapter<MetadataEntryWrapper, MetadataEntry> {
    private static Logger log = Logger.getLogger(MetadataEntryAdapter.class);

	@Override
	public MetadataEntryWrapper marshal(MetadataEntry entry) throws Exception {

		if (entry == null) { return null; }
		
		return(new MetadataEntryWrapper(entry));
	}

	@Override
	public MetadataEntry unmarshal(MetadataEntryWrapper v) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	private String getPreferredLabel(String key) { 
    	String label = ((Properties) RsConfigurationManager.getInstance().getAttribute(Constants.NAMINGMETA)).getProperty(key);
    	return ((label != null)? label : key);
	}

}
