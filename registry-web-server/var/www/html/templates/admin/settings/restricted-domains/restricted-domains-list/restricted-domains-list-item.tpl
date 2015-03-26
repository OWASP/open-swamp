<td class="domain-name first">
	<input type="text" class="name"<% if (typeof domain_name != 'undefined') { %> value="<%= domain_name %>"<% } %>>
</td>

<td class="description last">
	<input type="text" class="email"<% if (typeof description != 'undefined') { %> value="<%= description %>"<% } %>>
</td>

<% if (showDelete) { %>
<td class="transparent">
	<button type="button" class="delete"><i class="fa fa-times"></i></button>
</td>
<% } %>
				