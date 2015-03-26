<td class="name first">
	<input type="text" class="name" value="<%= model.get('invitee_name') %>" />
</td>

<td class="email last">
	<input type="text" class="email" value="<%= model.get('email') %>" />
</td>

<% if (showDelete) { %>
<td class="append">
	<button type="button" class="delete"><i class="fa fa-times"></i></button>
</td>
<% } %>
				