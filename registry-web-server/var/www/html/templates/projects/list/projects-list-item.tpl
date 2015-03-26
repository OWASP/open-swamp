<% if (!model.isDeactivated() || showDeactivatedProjects) { %>

<% if (showNumbering) { %>
<td class="prepend number">
	<%= index %>
</td>
<% } %>

<td class="name first">
	<a href="#projects/<%= project_uid %>"><%= full_name %></a>
</td>

<td class="description">
	<%= description %>
</td>

<td class="create-date datetime last">
	<% if (model.hasCreateDate()) { %>
	<%= sortableDate( model.getCreateDate() ) %>
	<% } %>
</td>

<% if (showDelete) { %>
<td class="append">
	<button type="button" class="delete"><i class="fa fa-times"></i></button>
</td>
<% } %>
<% } %>
