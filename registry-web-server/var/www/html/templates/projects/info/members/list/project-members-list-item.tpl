<td class="name first">
	<%= model.getFullName() %>
</td>

<td class="email">
	<a href="mailto:<%= model.get('email') %>"><%= model.get('email') %></a>
</td>

<td class="affiliation">
	<%= model.get('affiliation') %>
</td>

<td class="join-date datetime">
	<%/* projectMembership is for the current row, while currentProjectMembership is for the current user. */%>
	<% if (projectMembership.hasCreateDate()) { %>
	<%= sortableDate( projectMembership.getCreateDate() ) %>
	<% } %>
</td>

<td class="admin last">
	<% if (projectMembership && projectMembership.isAdmin()) { %>
	<input type="checkbox" checked <% if( project.get('owner').user_uid == model.get('user_uid') ){ %> disabled="disabled" <% } %> />
	<% } else {  %>
	<input type="checkbox" <% if( currentProjectMembership && !currentProjectMembership.isAdmin()){ %> disabled="disabled" <% } %> />
	<% } %>
</td>

<% if (showDelete) { %>
<td class="append">
	<% if( projectMembership && !projectMembership.isAdmin() && ( 
	( isAdmin ) || 
	( currentProjectMembership && currentProjectMembership.isAdmin() ) ||
	( projectMembership && projectMembership.sameUserAs(currentProjectMembership) ) ) ) { %>
	<button type="button" class="delete"><i class="fa fa-times"></i></button>
	<% } %>
</td>
<% } %>
