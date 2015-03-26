<td class="name first">
	<% if (invitee)	{ %>
		<% if (invitee.has('user_uid')) { %>
			<a href="<%= url %>/<%= invitee.get('user_uid') %>"><%= invitee.getFullName() %></a>
		<% } else { %>
			<%= invitee.getFullName() %>
		<% } %>
	<% } %>
</td>

<td class="inviter" style="border-right:none">
	<% if (inviter)	{ %>
		<% if (inviter.has('user_uid')) { %>
			<a href="<%= url %>/<%= inviter.get('user_uid') %>"><%= inviter.getFullName() %></a>
		<% } else { %>
			<%= inviter.getFullName() %>
		<% } %>
	<% } %>
</td>

<td class="date datetime" style="border-right:none">
	<% if (model.hasCreateDate()) { %>
	<%= sortableDate( model.getCreateDate() ) %>
	<% } %>
</td>

<td class="status last">
	<%= model.getStatus() %>
</td>

<% if (showDelete) { %>
<td class="append">
	<% if (model.isPending()) { %>
	<button type="button" class="delete"><i class="fa fa-times"></i></button>
	<% } %>
</td>
<% } %>