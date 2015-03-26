
<td class="title">
	<span class="title"><%= permission.title %></span>
</td>
<td class="description">
	<span class="name"><%= permission.description %></span>
</td>
<td class="expiration">
	<span class="expiration"><%= permission.expiration_date %></span>
</td>
<td class="status">
	<% if( admin ){ %>
		<select class="status" style="width: 100px">
			<option<%= permission.status == null ? ' selected="selected"' : ''%>></option>
			<option<%= permission.status == 'granted' ? ' selected="selected"' : ''%>>granted</option>
			<option<%= permission.status == 'revoked' ? ' selected="selected"' : ''%>>revoked</option>
			<option<%= permission.status == 'pending' ? ' selected="selected"' : ''%>>pending</option>
			<option<%= permission.status == 'expired' ? ' selected="selected"' : ''%>>expired</option>
			<option<%= permission.status == 'denied' ? ' selected="selected"' : ''%>>denied</option>
		</select>
	<% } else { %>
		<span class="status"><%= permission.status %></span>
	<% } %>
</td>
<td style="background: white" class="request">
		<% if( ! admin ){ %> <button class="btn request">Request</button> <% } %>
</td>

