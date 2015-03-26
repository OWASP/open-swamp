<!-- user's tools -->
<% if (collection.length > 0) { %>
<div class="well">
	<ul class="nav nav-pills nav-stacked">
		<li class="nav-header">Tools I own</li>
		<%
		for (var i = 0; i < collection.length; i++) {
			var model = collection.at(i);
		%>
		<li class="tool<%= model.get('tool_uuid') %>">
			<a href="#tools/<%= model.get('tool_uuid') %>"><i class="fa fa-wrench"></i><%= model.get('name') %></a>
		</li>
		<%
		}
		%>
	</ul>
</div>
<% } %>

<!-- option to create a new tool -->
<ul class="nav nav-pills nav-stacked">
	<li class="add-new-tool">
		<a href="#tools/add"><i class="fa fa-plus"></i>Add New Tool</a>
	</li>

<!-- tool administration -->
<% if (user.isAdmin()) { %>
	<li class="review-tool">
		<a href="#tools/review"><i class="fa fa-list"></i>Review Tools</a>
	</li>
<% } %>
</ul>