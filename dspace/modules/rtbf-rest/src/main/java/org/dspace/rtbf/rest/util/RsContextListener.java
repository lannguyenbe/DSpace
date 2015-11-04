package org.dspace.rtbf.rest.util;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;

import org.dspace.app.util.DSpaceContextListener;
import org.dspace.core.ConfigurationManager;
import org.dspace.rtbf.rest.common.Constants;
import org.dspace.rtbf.rest.common.MetadataEntry;

public class RsContextListener extends DSpaceContextListener {


    @Override
	public void contextInitialized(ServletContextEvent event) {

    	super.contextInitialized(event);
		
    	// For sortable fields, build map between frontend name and solr index name
    	int idx = 1;
		String definition;    	
	    Properties sortableEntries = new Properties();
	    while ((definition = ConfigurationManager.getProperty(Constants.WEBAPP_NAME, Constants.SORTMETA+".field." + idx)) != null) {
	        List<String> fields = new ArrayList<String>();
	        fields = Arrays.asList(definition.split(":"));
            sortableEntries.put(fields.get(0), fields.get(1));
	    	
	    	idx++;
	    }
        ServletContext sc = event.getServletContext();
        sc.setAttribute(Constants.SORTMETA, sortableEntries);
           
    }

}
