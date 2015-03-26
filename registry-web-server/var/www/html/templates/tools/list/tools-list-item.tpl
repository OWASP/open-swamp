<% if (!model.isDeactivated() || showDeactivatedPackages) { %>

<td class="name first">
	<% if (url) { %>
	<a href="<%= url %>"><%= model.get('name') %></a>
	<% } else { %>
	<%= model.get('name') %>
	<% } %>
</td>

<td class="package-types">
	<ul>
	<% var package_type_names = model.get('package_type_names'); %>
	<% for (var i = 0; i < package_type_names.length; i++) { %>
		<li><%= package_type_names[i] %></li>
	<% } %>
	</ul>
</td>

<td class="description">
	<%= model.get('description') %>
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
