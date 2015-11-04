package org.dspace.rtbf.rest.util;

import java.sql.SQLException;

import javax.servlet.ServletContext;


public class RsContext extends org.dspace.core.Context {
	
	private ServletContext servletContext;
	
	public RsContext() throws SQLException {
		super();
	}

	public ServletContext getServletContext() {
		return servletContext;
	}

	public void setServletContext(ServletContext servletContext) {
		this.servletContext = servletContext;
	}
	
	public Object getAttribute(String name) {
		if (servletContext != null) {
			return servletContext.getAttribute(name);
		} else {
			return null;
		}
		
		
	}

}
