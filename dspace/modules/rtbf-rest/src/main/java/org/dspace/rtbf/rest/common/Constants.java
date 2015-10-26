package org.dspace.rtbf.rest.common;

public class Constants extends org.dspace.core.Constants {

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

    // Keys for accessing  metadata
    public static final String REPOSITORY = "rtbf.identifier.attributor";
    public static final String ROYALTY = "rtbf.royalty_code";
    public static final String ROYALTY_TEXT = "rtbf.royalty_remark";
    public static final String SHORT_DESCRIPTION = "dc.description.abstract";
    public static final String FIRST_BROADCASTED = "dc.date.issued";
    public static final String CODE_ORIGINE = "rtbf.code_origine.*";

}
