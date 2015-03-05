package org.dspace.rtbf.rs;

import java.util.ArrayList;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.dspace.rtbf.rs.common.Todo;

@Path("/todo")
public class TodoResource {
	

	@GET
	@Path("json")
	@Produces({ MediaType.APPLICATION_JSON })
	public Todo getJSON() {
		Todo todo = new Todo();
		todo.setSummary("getJSON summary 1");
		todo.setDescription("getJSON description 1");
		
		return todo;
	}

	@GET
//	@Path("jsonarray")
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML })
	public Todo[] getJSONA() {
		Todo todo = new Todo();
		todo.setSummary("getJSONA summary 1");
		todo.setDescription("getJSONA description 1");
		
		ArrayList<Todo> results = new ArrayList<Todo>();
		results.add(todo);
		results.add(todo);
		
		
		return results.toArray(new Todo[0]);
	}
	
	
}
