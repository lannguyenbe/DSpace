package org.dspace.rtbf.rest.application;

import java.util.HashSet;
import java.util.Set;

import javax.ws.rs.core.Application;

import org.dspace.rtbf.rest.*;

public class RsApplication extends Application {

	@Override
	public Set<Class<?>> getClasses() {
        HashSet<Class<?>> set = new HashSet<Class<?>>(1);
        
        // Moxy registration
        // set.add(org.glassfish.jersey.moxy.json.MoxyJsonFeature.class);
        // set.add(RsMoxyJsonContextResolver.class);
        
        // Jackson2 registration
        set.add(org.glassfish.jersey.jackson.JacksonFeature.class);
        set.add(RsJacksonContextResolver.class);
        

        set.add(RsIndex.class);
        set.add(SearchResource.class);
        set.add(HandleResource.class);
        set.add(SequencesResource.class);
        set.add(EpisodesResource.class);
        set.add(SeriesResource.class);
        // LOV
        set.add(AuthorsResource.class);
        set.add(SubjectsResource.class);
        set.add(PlacesResource.class);
        set.add(IsPartOfTitlesResource.class);
        set.add(codeOriginesResource.class);
        return set;
	}

	
}
