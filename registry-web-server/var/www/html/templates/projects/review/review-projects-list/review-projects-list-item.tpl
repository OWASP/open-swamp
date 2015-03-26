<% if (!model.isDeactivated() || showDeactivatedProjects) { %>

<% if (showNumbering) { %>
<td class="prepend number">
	<%= index %>
</td>
<% } %>

<td class="full-name first">
	<a href="<%= url %>"><%= model.get('full_name') %></a>
</td>

<td class="owner">
	<% if (model && model.has('owner')) { %>
		<a href="mailto:<%= model.get('owner').email %>"><%= model.get('owner').first_name %> <%= model.get('owner').last_name %></a>
	<% } %>
</td>

<td class="create-date datetime">
	<% if (model.hasCreateDate()) { %>
	<%= sortableDate( model.getCreateDate() ) %>
	<% } %>
</td>

<td class="status last">
	<div class="btn-group">
		<a class="btn btn-small dropdown-toggle" data-toggle="dropdown">
			<% if ( model.isDeactivated() ) { %><span class="warning"><% } %>
			<%= model.getStatus().toTitleCase() %>
			<% if (model.getStatus() != "activated") { %></span><% } %>
			<span class="caret"></span>
		</a>
	 	<% if (model.isDeactivated()) { %>
		<ul class="dropdown-menu">
			<li><a class="activated">Activated</a></li>
		</ul>
		<% } else { %>
		<ul class="dropdown-menu">
			<li><a class="deactivated">Deactivated</a></li>
		</ul>
		<% } %>
	</div>
</td>
<% } %>
