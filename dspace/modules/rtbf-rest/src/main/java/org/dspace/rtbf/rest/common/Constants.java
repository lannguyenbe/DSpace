package org.dspace.rtbf.rest.common;

import org.dspace.discovery.DiscoverQuery.SORT_ORDER;

public class Constants extends org.dspace.core.Constants {
    public static final String WEBAPP_NAME = "rtbf-rest";

    // Config sections in the config file rtbf-rest.cfg
    public static final String SORTMETA = "sortMeta";
    public static final String NAMINGMETA = "namingMeta";

    // Type of view determine the choice of metadata to show 
    public static final int EXPANDELEM_VIEW = 1;
    public static final int MIN_VIEW = 2;
    public static final int SEARCH_RESULT_VIEW = 3;
    //
    public static final String SERIE_EXPAND_OPTIONS = "owningSerie,metadata";
    public static final String EPISODE_EXPAND_OPTIONS = "owningSerie,metadata";
    public static final String SEQUENCE_EXPAND_OPTIONS = "owningSerie,owningEpisode,parentEpisodeList,metadata";
    public static final String SEARCH_SEQUENCE_EXPAND_OPTIONS = "owningParentList";
    //
    public static final String[] TYPETEXT = { "none", "none", "SEQUENCE", "EPISODE", "SERIE", "none", "none", "none" };
    public static final int LIMITMAX = 5000;
    public static final String DEFAULT_LIMIT = "100";
    public static final int DEFAULT_RPP = Integer.valueOf(DEFAULT_LIMIT);
    public static final SORT_ORDER ORDER_DEFAULT = SORT_ORDER.asc;
    
    // Keys for accessing  metadata
    public static final String ATTRIBUTOR = "rtbf.identifier.attributor";
    public static final String ROYALTY = "rtbf.royalty_code";
    public static final String ROYALTY_REMARK = "rtbf.royalty_remark";
    public static final String ABSTRACT = "dc.description.abstract";
    public static final String DATE_ISSUED = "dc.date.issued";
    public static final String CHANNEL_ISSUED = "rtbf.channel_issued";
    public static final String CODE_ORIGINE = "rtbf.code_origine.*";
    public static final String TITLE = "dc.title";

}
