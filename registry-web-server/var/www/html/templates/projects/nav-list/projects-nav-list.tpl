<!-- projects that are owned -->
<% if (ownedProjects.length > 1) { %>
<div class="well">
	<ul class="nav nav-pills nav-stacked">
		<li class="nav-header">Projects I own</li>
		<%
		for (var i = 0; i < ownedProjects.length; i++) {
			var model = ownedProjects.at(i);
			if (!model.isTrialProject()) {
		%>
		<li class="project<%= model.get('project_uid') %>">
			<a href="#projects/<%= model.get('project_uid') %>"><i class="fa fa-folder-open"></i><%= model.get('short_name') %></a>
		</li>
		<%
			}
		}
		%>
	</ul>
</div>
<% } %>

<!-- projects that are not owned or pending -->
<% if (joinedProjects.length > 0) { %>
<div class="well">
	<ul class="nav nav-pills nav-stacked">
		<li class="nav-header">Projects I joined</li>
		<%
		for (var i = 0; i < joinedProjects.length; i++) {
			var model = joinedProjects.at(i);
			if (!model.isTrialProject()) {
		%>
		<li class="project<%= model.get('project_uid') %>">
			<a href="#projects/<%= model.get('project_uid') %>"><i class="fa fa-folder-open"></i><%= model.get('short_name') %></a>
		</li>
		<%
			}
		}
		%>
	</ul>
</div>
<% } %>

<!-- option to create a new project -->
<ul class="nav nav-pills nav-stacked" style="display:none">
<li id="add-new-project">
	<a><i class="fa fa-plus"></i>Add New Project</a>
</li>

<!-- project administration -->
<% if (user.isAdmin()) { %>
	<li id="review-projects">
		<a><i class="fa fa-list"></i>Review Projects</a>
	</li>
<% } %>
</ul>
