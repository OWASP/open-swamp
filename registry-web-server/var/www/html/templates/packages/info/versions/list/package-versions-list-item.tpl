<td class="version-string first">
	<% if (url) { %>
	<a href="<%= url %>"><%= version_string %></a>
	<% } else { %>
	<%= version_string %>
	<% } %>
</td>

<td class="notes">
	<%= notes %>
</td>

<td class="date datetime last">
	<%= sortableDate( model.get('create_date') ) %>
</td>

<% if (showDelete) { %>
<td class="append">
	<button type="button" class="delete"><i class="fa fa-times"></i></button>
</td>
<% } %>
