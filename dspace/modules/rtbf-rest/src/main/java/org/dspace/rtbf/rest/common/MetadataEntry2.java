/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
package org.dspace.rtbf.rest.common;

import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;

/**
 * @author peterdietz, Rostislav Novak (Computing and Information Centre, CTU in
 *         Prague)
 * 
 */
@XmlJavaTypeAdapter(MetadataEntry2Adapter.class)
@XmlRootElement(name = "metadataentry2")
public class MetadataEntry2
{
    String key;

    String value;

    String language;

    public MetadataEntry2()
    {
    }

    public MetadataEntry2(String key, String value, String language)
    {
        this.key = key;
        this.value = value;
        this.language = language;
    }

    public String getValue()
    {
        return value;
    }

    public void setValue(String value)
    {
        this.value = value;
    }

    public String getKey()
    {
        return key;
    }

    public void setKey(String key)
    {
        this.key = key;
    }

    public String getLanguage()
    {
        return language;
    }

    public void setLanguage(String language)
    {
        this.language = language;
    }

}
