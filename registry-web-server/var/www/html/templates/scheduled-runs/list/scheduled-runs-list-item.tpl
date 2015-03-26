<% if (showNumbering) { %>
<td class="prepend number">
	<%= index %>
</td>
<% } %>

<td class="package first">
	<a href="<%= packageUrl %>"><span class="name"><%= package_name %></span></a>
	<% if (packageVersionUrl) { %>
	<a href="<%= packageVersionUrl %>"><span class="version label"><%= package_version_string %></span></a>
	<% } else { %>
	<span class="version label"><%= package_version_string %></span>
	<% } %>
</td>

<td class="tool">
	<a href="<%= toolUrl %>"><span class="name"><%= tool_name %></span></a>
	<% if (toolVersionUrl) { %>
	<a href="<%= toolVersionUrl %>"><span class="version label"><%= tool_version_string %></span></a>
	<% } else { %>
	<span class="version label"><%= tool_version_string %></span>
	<% } %>
</td>

<td class="platform">
	<a href="<%= platformUrl %>"><span class="name"><%= platform_name %></span></a>
	<% if (platformVersionUrl) { %>
	<a href="<%= platformVersionUrl %>"><span class="version label"><%= platform_version_string %></span></a>
	<% } else { %>
	<span class="version label"><%= platform_version_string %></span>
	<% } %>
</td>

<td class="schedule last">
	<span data-toggle="tooltip" data-placement="bottom" data-original-title="<%= runRequest.get('description') %>">
		<% if (runRequestUrl) { %>
		<a href="<%= runRequestUrl %>"><%= runRequest.get('name') %></a>
		<% } else { %>
 		<%= runRequest.get('name') %>
		<% } %>
	</span>
</td>

<% if (showDelete) { %>
<td class="append">
	<button type="button" class="delete"><i class="fa fa-times"></i></button>
</td>
<% } %>
