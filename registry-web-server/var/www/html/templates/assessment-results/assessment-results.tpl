<h1>
	<div><i class="fa fa-bug"></i></div>
	<% if (project.isTrialProject()) { %>
	Assessment Results
	<% } else { %>
	Project <span class="name"><%= project.get('short_name') %> %></span> Assessment Results
	<% } %>
</h1>

<p>The following assessment results are available for <strong><%= package_name %> <%= package_version %></strong> using <strong><%= tool_name %> <%= tool_version %></strong> running on <strong><%= platform_name %> <%= platform_version %></strong>.</p>

<iframe id="assessment-results" frameborder="0" style="width:100%" />
