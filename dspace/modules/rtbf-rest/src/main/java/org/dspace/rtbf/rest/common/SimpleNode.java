package org.dspace.rtbf.rest.common;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class SimpleNode {
    
    public enum Attribute {
        TITLE, NAME, SUBJECT
    }
	
	private String title;
    private String name;
    private String subject;
	
	public SimpleNode() {}
	
	public SimpleNode(String t) {
		this.title = t;
	}
	
	public String getTitle() {
		return this.title;
	}
	
    public String getName() {
        return this.name;
    }

    public String getSubject() {
        return this.subject;
    }

    public void setTitle(String s) {
		this.title = s;
	}

    public void setName(String s) {
        this.name = s;
    }
    
    public void setSubject(String s) {
        this.subject = s;
    }

    public SimpleNode setAttribute(Attribute name, String val) {
        switch (name) {
        case TITLE:
            this.title = val;
            break;
        case NAME:
            this.name = val;
            break;
        case SUBJECT:
            this.subject = val;
            break;
        default:
            break;
        }
        
        return this;
        
    }

	
}
