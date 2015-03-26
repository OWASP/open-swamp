<% if (showNumbering) { %>
<td class="prepend number">
	<%= index %>
</td>
<% } %>

<td class="prepend select">
	<input type="checkbox" name="select" />
</td>

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

<td class="results last" style="text-align:center;font-weight:normal">
	<% if (num_execution_records > 0) { %>
	<button><i class="fa fa-bug"></i> <span class="badge"><%= num_execution_records %></span></button>
	<% } else { %>
	<button><i class="fa fa-bug"></i> <span class="badge badge-important"><%= num_execution_records %></span></button>
	<% } %>
</td>

<% if (showDelete) { %>
<td class="append">
	<button type="button" class="delete"><i class="fa fa-times"></i></button>
</td>
<% } %>
