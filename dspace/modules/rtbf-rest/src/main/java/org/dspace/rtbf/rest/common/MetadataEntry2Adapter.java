package org.dspace.rtbf.rest.common;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.adapters.XmlAdapter;

public class MetadataEntry2Adapter extends XmlAdapter<JAXBElement<String>, MetadataEntry2> {

	@Override
	public MetadataEntry2 unmarshal(JAXBElement<String> v) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public JAXBElement<String> marshal(MetadataEntry2 v) throws Exception {
		if (v == null) { return null; }
		return (new JAXBElement<String>(
				new javax.xml.namespace.QName(v.getKey())
				, String.class
				,v.getValue()
		));
	}


}
