<td class="name first">
	<%= model.get('invitee_name') %>
</td>

<td class="email" style="border-right:none">
	<a href="mailto:<%= model.get('email') %>"><%= model.get('email') %></a>
</td>

<td class="date datetime" style="border-right:none">
	<% if (model.hasCreateDate()) { %>
	<%= sortableDate( model.getCreateDate() ) %>
	<% } %>
</td>

<td class="status last">
	<%= model.getStatus().toTitleCase() %>
</td>

<% if (showDelete) { %>
<td class="append">
	<% if (model.isPending()) { %>
	<button type="button" class="delete"><i class="fa fa-times"></i></button>
	<% } %>
</td>
<% } %>