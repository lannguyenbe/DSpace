package org.dspace.rtbf.rest.common;

import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlAnyElement;


public class MetadataWrapper {
	@XmlAnyElement
	public List<JAXBElement<String>> elements = new ArrayList<JAXBElement<String>>();
	
}
