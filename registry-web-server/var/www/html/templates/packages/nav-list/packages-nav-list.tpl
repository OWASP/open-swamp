<!-- user's packages -->
<% if (collection.length > 0) { %>
<div class="well">
	<ul class="nav nav-pills nav-stacked">
		<li class="nav-header">Packages I own</li>
		<%
		for (var i = 0; i < collection.length; i++) {
			var model = collection.at(i);
		%>
		<li class="package<%= model.get('package_uuid') %>">
			<a href="#packages/<%= model.get('package_uuid') %>"><i class="fa fa-gift"></i><%= model.get('name') %></a>
		</li>
		<%
		}
		%>
	</ul>
</div>
<% } %>

<!-- option to create a new project -->
<ul class="nav nav-pills nav-stacked" style="display:none">
	<li class="add-new-package">
		<a href="#packages/add"><i class="fa fa-plus"></i>Add New Package</a>
	</li>

<!-- package administration -->
<% if (user && user.isAdmin()) { %>
	<li class="review-packages">
		<a href="#packages/review"><i class="fa fa-list"></i>Review Packages</a>
	</li>
<% } %>
</ul>