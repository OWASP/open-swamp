<% if (!model.isDeactivated() || showDeactivatedPackages) { %>

<% if (showNumbering) { %>
<td class="prepend number">
	<%= index %>
</td>
<% } %>

<td class="name first">
	<% if (url) { %>
	<a href="<%= url %>"><%= model.get('name') %></a>
	<% } else { %>
	<%= model.get('name') %>
	<% } %>
</td>

<td class="description">
	<%= model.get('description') %>
</td>

<td class="package-type">
	<%= model.get('package_type') %>
</td>

<td class="create-date datetime last">
	<% if (model.hasCreateDate()) { %>
	<%= sortableDate( model.getCreateDate() ) %>
	<% } %>
</td>

<% if (showDelete) { %>
<td class="append">
	<% if (model.isOwned()) { %>
	<button type="button" class="delete"><i class="fa fa-times"></i></button>
	<% } %>
</td>
<% } %>

<% } %>
