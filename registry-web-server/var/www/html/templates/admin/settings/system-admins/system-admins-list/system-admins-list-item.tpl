<td class="name first">
	<% if (model.has('user_uid')) { %>
		<a href="<%= url %>/<%= model.get('user_uid') %>"><%= model.getFullName() %></a>
	<% } else { %>
		<%= model.getFullName() %>
	<% } %>
</td>

<td class="email last">
	<a href="mailto:<%= email %>"><%= email %></a>
</td>

<% if (showDelete) { %>
<td class="append">
	<button type="button" class="delete"><i class="fa fa-times"></i></button>
</td>
<% } %>
				