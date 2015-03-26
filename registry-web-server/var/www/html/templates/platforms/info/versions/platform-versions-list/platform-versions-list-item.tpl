<td class="version-string first">
	<% if (typeof(url) != 'undefined') { %>
	<a href="<%= url %>"><%= version_string %></a>
	<% } else { %>
	<%= version_string %>
	<% } %>
</td>

<td class="notes">
	<% if (typeof notes !== 'undefined') { %>
	<%= notes %>
	<% } %>
</td>

<td class="date datetime last">
	<% if (model.hasCreateDate()) { %>
	<%= sortableDate(model.getCreateDate()) %>
	<% } %>
</td>

<% if (showDelete) { %>
<td class="append">
	<button type="button" class="delete"><i class="fa fa-times"></i></button>
</td>
<% } %>
