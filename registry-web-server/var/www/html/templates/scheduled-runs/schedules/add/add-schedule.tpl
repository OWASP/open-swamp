<h1>
	<div><i class="fa fa-plus"></i></div>
	<% if (project.isTrialProject()) { %>
	Add New Run Request Schedule
	<% } else { %>
	Add New <span class="name"><%= project.get('short_name') %></span> Run Request Schedule
	<% } %>
</h1>

<ol class="breadcrumb">
	<li><a href="#home"><i class="fa fa-home"></i>Home</a></li>

	<% if (project) { %>
	<% if (project.isTrialProject()) { %>
	<li><a href="#run-requests"><i class="fa fa-check"></i>Scheduled Runs</a></li>
	<% } else { %>
	<li><a href="#run-requests?project=<%= project.get('project_uid') %>"><i class="fa fa-check"></i><%= project.get('short_name') %> Scheduled Runs</a></li>
	<% } %>
	<% } else { %>
	<li><a href="#run-requests?project=all"><i class="fa fa-bus"></i>All Scheduled Runs</a></li>
	<% } %>

	<% if (project.isTrialProject()) { %>
	<li><a href="#run-requests/schedules"><i class="fa fa-calendar"></i>Schedules</a></li>
	<% } else { %>
	<li><a href="#run-requests/schedules?project=<%= project.get('project_uid') %>"><i class="fa fa-calendar"></i><%= project.get('short_name') %> Schedules</a></li>
	<% } %>
	<li><i class="fa fa-plus"></i>Add Schedule</li>
</ol>

<div id="schedule-profile-form"></div>
<h2>Run Requests</h2>
<div id="schedule-items-list">
	<div align="center"><i class="fa fa-spinner fa-spin fa-2x"></i><br/>Loading schedule items...</div>
</div>

<div class="buttons">
	<button id="add-request" class="btn btn-primary btn-large"><i class="fa fa-plus"></i>Add Request</button>
	<button id="save" class="btn btn-large"><i class="fa fa-save"></i>Save</button>
	<button id="cancel" class="btn btn-large"><i class="fa fa-times"></i>Cancel</button>
</div>
