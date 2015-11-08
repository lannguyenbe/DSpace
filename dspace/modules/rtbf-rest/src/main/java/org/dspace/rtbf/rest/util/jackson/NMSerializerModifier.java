package org.dspace.rtbf.rest.util.jackson;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import org.apache.log4j.Logger;
import org.dspace.rtbf.rest.common.Constants;
import org.dspace.rtbf.rest.common.DSpaceObject;
import org.dspace.rtbf.rest.util.RsConfigurationManager;
import org.mortbay.log.Log;

import com.fasterxml.jackson.databind.BeanDescription;
import com.fasterxml.jackson.databind.SerializationConfig;
import com.fasterxml.jackson.databind.ser.BeanPropertyWriter;
import com.fasterxml.jackson.databind.ser.BeanSerializerModifier;

public class NMSerializerModifier extends BeanSerializerModifier {
    private static Logger log = Logger.getLogger(NMSerializerModifier.class);

	@Override
    public List<BeanPropertyWriter> changeProperties(
            SerializationConfig config, BeanDescription beanDesc,
            List<BeanPropertyWriter> beanProperties) {

        List<NameMapper> propertyMappings = getNameMappingsFromConfig();
Log.info("debug 011: propertyMappings"+ ((propertyMappings == null) ? "is null" : "is not null"));
        NameMapper mapping = mappingsForClass(propertyMappings,
                beanDesc.getBeanClass());
Log.info("debug 101:"+beanDesc.getBeanClass().getName());
        if (mapping == null) {
            return beanProperties;
        }
Log.info("debug 102");

        List<BeanPropertyWriter> propsToWrite = new ArrayList<BeanPropertyWriter>();
        for (BeanPropertyWriter propWriter : beanProperties) {
            String propName = propWriter.getName();
            String outputName = mapping.nameMappings.getProperty(propName);
            if (outputName != null) {
                BeanPropertyWriter modifiedWriter = new NameMappingWriter(
                        propWriter, outputName);
                propsToWrite.add(modifiedWriter);
            } else {
                propsToWrite.add(propWriter);
            }
        }
        return propsToWrite;
    }

	private NameMapper mappingsForClass(
			List<NameMapper> nameMappings, Class<?> beanClass) {
        for (NameMapper mapping : nameMappings) {
            if (mapping.classToFilter.equals(beanClass)) {
                return mapping;
            }
        }
        return null;
	}

/*
	private List<PropertyNameMapper> getNameMappingsFromRequest() {
        RequestAttributes requestAttribs = RequestContextHolder
                .getRequestAttributes();
        List<PropertyNameMapper> nameMappings = (List<PropertyNameMapper>) requestAttribs
                .getAttribute("nameMappings",
                        RequestAttributes.SCOPE_REQUEST);
        return nameMappings;
    }
*/

	private List<NameMapper> getNameMappingsFromConfig() {
		List<NameMapper> nameMappings = new ArrayList<>();
		Properties props;
		
		props = (Properties) RsConfigurationManager.getInstance().getAttribute(Constants.NAMINGMETA);
		nameMappings.add(new NameMapper(org.dspace.rtbf.rest.common.DSpaceObject.class
//				, (Properties) RsConfigurationManager.getInstance().getAttribute(Constants.NAMINGMETA)
				, props
				));
		nameMappings.add(new NameMapper(org.dspace.rtbf.rest.common.Sequence.class, props));
		nameMappings.add(new NameMapper(org.dspace.rtbf.rest.common.Episode.class, props));
		nameMappings.add(new NameMapper(org.dspace.rtbf.rest.common.Serie.class, props));
		
		return nameMappings;
		
	}
}
