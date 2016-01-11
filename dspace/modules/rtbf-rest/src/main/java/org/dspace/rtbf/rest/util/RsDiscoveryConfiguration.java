package org.dspace.rtbf.rest.util;

import java.util.ArrayList;
import java.util.List;

import org.dspace.discovery.configuration.DiscoveryConfiguration;
import org.dspace.discovery.configuration.DiscoveryHitHighlightFieldConfiguration;

public class RsDiscoveryConfiguration {
	
	private static RsDiscoveryConfiguration instance = new RsDiscoveryConfiguration();
	
	private org.dspace.discovery.configuration.DiscoveryConfiguration config;
	private List<org.dspace.discovery.configuration.DiscoveryHitHighlightFieldConfiguration> highlightFields = new ArrayList<DiscoveryHitHighlightFieldConfiguration>();
	
	public static RsDiscoveryConfiguration getInstance() {
		return instance;
	}
	
	public void setConfiguration(DiscoveryConfiguration config) {
		this.config = config;
		if (config.getHitHighlightingConfiguration() != null) {
			this.highlightFields = config.getHitHighlightingConfiguration().getMetadataFields();
		}
	}
	
	public DiscoveryConfiguration getConfig() {
		return this.config;
	}
	
	public static List<DiscoveryHitHighlightFieldConfiguration> getHighlightFieldConfigurations() {
		return(instance.highlightFields);
	}
		
}
