<td class="prepend select">
	<input type="radio" name="schedule" index="<%= itemIndex %>" />
</td>

<td class="first name">
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
