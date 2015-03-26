<% if (!model.isDeactivated() || showDeactivatedPackages) { %>

<% if (showNumbering) { %>
<td class="prepend number">
	<%= index %>
</td>
<% } %>

<td class="name first">
	<a href="<%= url %>"><%= model.get('name') %></a>
</td>

<td class="type">
	<%= model.getPackageTypeName() %>
</td>

<td class="create-date datetime last">
	<% if (model.hasCreateDate()) { %>
	<%= sortableDate( model.getCreateDate() ) %>
	<% } %>
</td>

<% if (showDelete) { %>
<td class="append">
	<% if (!model.isDeactivated()) { %>
	<button type="button" class="delete" uid="<%= model.get('package_uuid') %>"><i class="fa fa-close"></i></button>
	<% } %>
</td>
<% } %>
<% } %>
