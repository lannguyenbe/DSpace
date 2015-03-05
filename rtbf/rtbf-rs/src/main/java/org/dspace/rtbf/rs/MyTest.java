package org.dspace.rtbf.rs;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

@Path("mytest")
//public class MyTest extends Resource{
public class MyTest extends Resource {

	@GET
    @Produces(MediaType.TEXT_PLAIN)
    public String getIt() {
        return "in Mytest 2";
    }
}
