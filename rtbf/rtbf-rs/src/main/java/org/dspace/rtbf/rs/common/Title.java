package org.dspace.rtbf.rs.common;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class Title {
	
	public String title;
	
	public Title() {}
	
	public Title(String t) {
		this.title = t;
	}
	
	public String getTitle() {
		return this.title;
	}
	
	public void setTitle(String t) {
		this.title = t;
	}

}
