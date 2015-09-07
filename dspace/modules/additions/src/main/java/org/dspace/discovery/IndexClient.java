/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
package org.dspace.discovery;

import org.apache.log4j.Logger;
import org.apache.commons.cli.*;
import org.dspace.core.Context;
import org.dspace.utils.DSpace;

import java.io.IOException;
import java.sql.SQLException;

/**
 * Class used to reindex dspace communities/collections/items into discovery
 *
 * @author Kevin Van de Velde (kevin at atmire dot com)
 * @author Mark Diggory (markd at atmire dot com)
 * @author Ben Bosman (ben at atmire dot com)
 */
public class IndexClient {


    private static final Logger log = Logger.getLogger(IndexClient.class);

    /**
     * When invoked as a command-line tool, creates, updates, removes content
     * from the whole index
     *
     * @param args the command-line arguments, none used
     * @throws java.io.IOException
     * @throws java.sql.SQLException
     *
     */
    public static void main(String[] args) throws SQLException, IOException, SearchServiceException {

        Context context = new Context();
        context.setIgnoreAuthorization(true);

        String usage = "org.dspace.discovery.IndexClient [-cbhf[r <item handle>]] or nothing to update/clean an existing index.";
        Options options = new Options();
        HelpFormatter formatter = new HelpFormatter();
        CommandLine line = null;

        options
                .addOption(OptionBuilder
                        .withArgName("item handle")
                        .hasArg(true)
                        .withDescription(
                                "remove an Item, Collection or Community from index based on its handle")
                        .create("r"));


        options
                .addOption(OptionBuilder
                        .isRequired(false)
                        .withDescription(
                                "clean existing index removing any documents that no longer exist in the db")
                        .create("c"));

        options.addOption(OptionBuilder.isRequired(false).withDescription(
                "(re)build index, wiping out current one if it exists").create(
                "b"));
        
        /* Lan 20.11.2014 : add option -B */        
        options
        		.addOption(OptionBuilder
        				.isRequired(false)
        				.withDescription("(re)build index for Big database, wiping out current one if it exists")
        				.create("B"));        

        /* Lan 20.11.2014 : add option -CC */        
        options
        		.addOption(OptionBuilder
        				.isRequired(false)
        				.withDescription("(re)build index on communities and collections only")
        				.create("CC"));        

        /* Lan 21.11.2014 : add option -C */        
        options
        		.addOption(OptionBuilder
        				.isRequired(false)
        				.hasArg()
        				.withArgName("community id")
        				.withDescription("(re)build index for the community identifier")
        				.create("C")
        				);

        /* Lan 23.11.2014 : add option -I */        
        options
        		.addOption(OptionBuilder
        				.isRequired(false)
        				.hasArg()
        				.withArgName("item id")
        				.withDescription("incremental index from the item id")
        				.create("I")
        				);

        /* Lan 07.09.2015 : add option -Ito */        
        options
        		.addOption(OptionBuilder
        				.isRequired(false)
        				.hasArg(true)
        				.withArgName("item id")
        				.withDescription("incremental index to the given item id")
        				.create("Ito")
        				);

        options.addOption(OptionBuilder.isRequired(false).withDescription(
                "Rebuild the spellchecker, can be combined with -b and -f.").create(
                "s"));

        options
                .addOption(OptionBuilder
                        .isRequired(false)
                        .withDescription(
                                "if updating existing index, force each handle to be reindexed even if uptodate")
                        .create("f"));

        options.addOption(OptionBuilder.isRequired(false).withDescription(
                "print this help message").create("h"));

        options.addOption(OptionBuilder.isRequired(false).withDescription(
                "optimize search core").create("o"));

        try {
            line = new PosixParser().parse(options, args);
        } catch (Exception e) {
            // automatically generate the help statement
            formatter.printHelp(usage, e.getMessage(), options, "");
            System.exit(1);
        }

        if (line.hasOption("h")) {
            // automatically generate the help statement
            formatter.printHelp(usage, options);
            System.exit(1);
        }

        /** Acquire from dspace-services in future */
        /**
         * new DSpace.getServiceManager().getServiceByName("org.dspace.discovery.SolrIndexer");
         */

        DSpace dspace = new DSpace();

        IndexingService indexer = dspace.getServiceManager().getServiceByName(IndexingService.class.getName(),IndexingService.class);
        org.dspace.discovery.SolrServiceImpl indexer2 = (org.dspace.discovery.SolrServiceImpl) indexer;

        if (line.hasOption("r")) {
            log.info("Removing " + line.getOptionValue("r") + " from Index");
            indexer.unIndexContent(context, line.getOptionValue("r"));
        } else if (line.hasOption("c")) {
            log.info("Cleaning Index");
            indexer.cleanIndex(line.hasOption("f"));
        } else if (line.hasOption("b")) {
            log.info("(Re)building index from scratch.");
            indexer.createIndex(context);
            checkRebuildSpellCheck(line, indexer);
        } else if (line.hasOption("B")) { /* Lan 20.11.2014 */
            log.info("(Re)building index from scratch for large databse.");
            indexer2.updateIndexBig(context, true);
            checkRebuildSpellCheck(line, indexer2);
        } else if (line.hasOption("CC")) { /* Lan 21.11.2014 */
            log.info("(Re)building index for communities and collections.");
            indexer2.updateIndexCC(context, true);
            checkRebuildSpellCheck(line, indexer2);
        } else if (line.hasOption("C")) { /* Lan 21.11.2014 */
            log.info("(Re)building index for the community id.");
        	int communityId = Integer.parseInt(line.getOptionValue("C"));
            indexer2.updateIndexC(context, communityId, true);
            checkRebuildSpellCheck(line, indexer2);
        } else if (line.hasOption("I")) { /* Lan 21.11.2014 */
            log.info("Increment index from item id.");
        	int itemId = Integer.parseInt(line.getOptionValue("I"));
        	if (line.hasOption("Ito")) { /* Lan 07.09.2015 */
                log.info("Increment index to the given item id.");
                int itemIto = Integer.parseInt(line.getOptionValue("Ito"));
                indexer2.updateIndexIto(context, itemId, itemIto, true);
        	} else {
        		indexer2.updateIndexI(context, itemId, true);
        	}
            checkRebuildSpellCheck(line, indexer2);
        } else if (line.hasOption("o")) {
            log.info("Optimizing search core.");
            indexer.optimize();
        } else if(line.hasOption('s')) {
            checkRebuildSpellCheck(line, indexer);
        } else {
            log.info("Updating and Cleaning Index");
            indexer.cleanIndex(line.hasOption("f"));
            indexer.updateIndex(context, line.hasOption("f"));
            checkRebuildSpellCheck(line, indexer);
        }

        log.info("Done with indexing");
	}

    /**
     * Check the command line options and rebuild the spell check if active.
     * @param line the command line options
     * @param indexer the solr indexer
     * @throws SearchServiceException in case of a solr exception
     */
    protected static void checkRebuildSpellCheck(CommandLine line, IndexingService indexer) throws SearchServiceException {
        if (line.hasOption("s")) {
            log.info("Rebuilding spell checker.");
            indexer.buildSpellCheck();
        }
    }
}
