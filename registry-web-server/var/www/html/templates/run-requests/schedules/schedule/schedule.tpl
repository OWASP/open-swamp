<h1>
	<div><i class="fa fa-calendar"></i></div>
	<span class="name"><%= name %></span> Run Request Schedule
</h1>

<ol class="breadcrumb">
	<li><a href="#home"><i class="fa fa-home"></i>Home</a></li>

	<% if (project) { %>
	<% if (project.isTrialProject()) { %>
	<li><a href="#run-requests"><i class="fa fa-bus"></i>Scheduled Runs</a></li>
	<% } else { %>
	<li><a href="#run-requests?project=<%= project.get('project_uid') %>"><i class="fa fa-bus"></i><%= project.get('short_name') %> Scheduled Runs</a></li>
	<% } %>
	<% } else { %>
	<li><a href="#run-requests/all"><i class="fa fa-bus"></i>All Scheduled Runs</a></li>
	<% } %>

	<% if (project) { %>
	<% if (project.isTrialProject()) { %>
	<li><a href="#run-requests/schedules"><i class="fa fa-calendar"></i>Schedules</a></li>
	<% } else { %>
	<li><a href="#run-requests/schedules?project=<%= project.get('project_uid') %>"><i class="fa fa-calendar"></i><%= project.get('short_name') %> Schedules</a></li>
	<% } %>
	<% } else { %>
	<li><a href="#run-requests/schedules?project=all"><i class="fa fa-calendar"></i>All Schedules</a></li>
	<% } %>

	<li><i class="fa fa-calendar"></i><%= name %> Schedule</li>
</ol>

<div class="well">
	<div id="schedule-profile"></div>
</div>

<h2>Run Requests</h2>
<div id="schedule-items-list">
	<div align="center"><i class="fa fa-spinner fa-spin fa-2x"></i><br/>Loading schedule items...</div>
</div>

<div class="buttons">
	<button id="ok" class="btn btn-primary btn-large"><i class="fa fa-check"></i>OK</button>
	<button id="edit" class="btn btn-large"><i class="fa fa-pencil"></i>Edit Schedule</button>
</div>
