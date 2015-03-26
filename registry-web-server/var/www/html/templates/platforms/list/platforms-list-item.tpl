<td class="name first">
	<% if (user) { %>
	<a href="#platforms/<%= model.get('platform_uuid') %>"><%= model.get('name') %></a>
	<% } else { %>
	<%= model.get('name') %>
	<% } %>
</td>
<td class="description">
	<%= model.get('description') %>
</td>
<td class="create-date datetime last">
	<% if (model.hasCreateDate()) { %>
	<%= sortableDate( model.getCreateDate() ) %>
	<% } %>
</td>
