<h1>
	<div><i class="fa fa-pencil"></i></div>
	Edit <span class="name"><%= name %></span> Run Request Schedule
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

	<li><a href="#run-requests/schedules/<%= model.get('run_request_uuid') %>"><i class="fa fa-calendar"></i><%= name %> Schedule</a></li>

	<li><i class="fa fa-pencil"></i>Edit Schedule</li>
</ol>

<div id="schedule-profile-form"></div>
<h2>Run Requests</h2>
<div id="schedule-items-list"></div>

<div class="buttons">
	<button id="add-request" class="btn btn-primary btn-large"><i class="fa fa-plus"></i>Add Request</button>
	<button id="save" class="btn btn-large"><i class="fa fa-save"></i>Save</button>
	<button id="cancel" class="btn btn-large"><i class="fa fa-times"></i>Cancel</button>
</div>
