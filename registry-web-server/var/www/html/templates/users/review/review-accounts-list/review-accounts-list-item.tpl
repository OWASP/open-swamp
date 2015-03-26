<% if (!model.isDisabled() || showDisabledAccounts) { %>

<% if (showNumbering) { %>
<td class="prepend number">
	<%= index %>
</td>
<% } %>

<td class="username first">
	<a href="<%= url %>"><%= model.get('username') %></a>
</td>

<td class="full-name">
	<a href="mailto:<%= model.get('email') %>"><%= model.getFullName() %></a>
</td>

<td class="affiliation">
	<%= model.get('affiliation') %>
</td>

<td class="create-date datetime">
	<% if (model.hasCreateDate()) { %>
	<%= sortableDate( model.getCreateDate() ) %>
	<% } %>
</td>

<td class="status last">
	<div class="btn-group">
		<a class="btn btn-small dropdown-toggle" data-toggle="dropdown">
			<% if (!model.isEnabled()) { %><span class="warning"><% } %>
			<%= model.getStatus().toTitleCase() %>
			<% if (!model.isEnabled()) { %></span><% } %>
			<span class="caret"></span>
		</a>
		<ul class="dropdown-menu">
			<li><a class="pending">Pending</a></li>
			<li><a class="enabled">Enabled</a></li>
			<li><a class="disabled">Disabled</a></li>
		</ul>
	</div>
</td>
<% } %>
