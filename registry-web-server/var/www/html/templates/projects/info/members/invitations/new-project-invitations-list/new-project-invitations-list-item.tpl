<td class="name first">
	<input type="text" class="name" name="invitee_name_<%= model.cid %>" 
	<% if (typeof invitee_name != 'undefined') { %>value="<%= invitee_name %>"<% } %> />
</td>

<td class="email last">
	<input type="email" class="email" name="invitee_email_<%= model.cid %>"
	<% if (typeof email != 'undefined') { %>value="<%= email %>"<% } %> />
</td>

<% if (showDelete) { %>
<td class="append">
	<button type="button" class="delete"><i class="fa fa-times"></i></button>
</td>
<% } %>
