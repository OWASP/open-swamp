<% if (showNumbering) { %>
<td class="prepend number">
	<%= index %>
</td>
<% } %>

<td class="name first">
	<% if (url) { %>
	<a href="<%= url %>"><%= name %></a>
	<% } else { %>
		<%= name %>
	<% } %>
</td>

<td class="description last">
	<%= description %>
</td>

<% if (showDelete) { %>
<td class="append">
	<% if (url) { %>
	<button type="button" class="delete"><i class="fa fa-times"></i></button>
	<% } %>
</td>
<% } %>
