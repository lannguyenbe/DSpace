package org.dspace.rtbf.rest.common;

import java.util.List;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import org.apache.log4j.Logger;
import org.dspace.rtbf.rest.common.RTBObject;

public class RTBObjectParts {
    private static Logger log = Logger.getLogger(RTBObjectParts.class);
	
		
		public static class Diffusion {
		
			private String channel;
			private String diffusion_datetime;
		    protected List<RTBObject> owningParentList;
		    
		    public Diffusion() {}
		    
		    public Diffusion(String channel, String dt, List<RTBObject> list) {
		    	setChannel(channel);
		    	setDiffusion_datetime(dt);
		    	setOwningParentList(list);
		    }
		    
			public String getChannel() {
				return channel;
			}
			public void setChannel(String channel) {
				this.channel = channel;
			}
			public String getDiffusion_datetime() {
				return diffusion_datetime;
			}
			public void setDiffusion_datetime(String diffusion_datetime) {
				this.diffusion_datetime = diffusion_datetime;
			}
	
			@XmlElementWrapper( name = "owningParentList")
			@XmlElement( name = "owningParent")
			public List<RTBObject> getOwningParentList() {
				return owningParentList;
			}
	
			public void setOwningParentList(List<RTBObject> owningParentList) {
				this.owningParentList = owningParentList;
			}
		}
		
		
}
