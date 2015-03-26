<h1>
	<div><i class="fa fa-calendar"></i></div>
	<% if (project) { %>
	<% if (project.isTrialProject()) { %>
	Run Request Schedules
	<% } else { %>
	<span class="name"><%= project.get('short_name') %></span> Run Request Schedules
	<% } %>
	<% } else { %>
	All Run Request Schedules
	<% } %>
</h1>

<ol class="breadcrumb">
	<li><a href="#home"><i class="fa fa-home"></i>Home</a></li>

	<% if (project) { %>
	<% if (project.isTrialProject()) { %>
	<li><a href="#run-requests?project=none"><i class="fa fa-bus"></i>Scheduled Runs</a></li>
	<% } else { %>
	<li><a href="#run-requests?project=<%= project.get('project_uid') %>"><i class="fa fa-bus"></i><%= project.get('short_name') %> Scheduled Runs</a></li>
	<% } %>
	<% } else { %>
	<li><a href="#run-requests"><i class="fa fa-bus"></i>All Scheduled Runs</a></li>
	<% } %>

	<% if (project) { %>
	<% if (project.isTrialProject()) { %>
	<li><i class="fa fa-calendar"></i>Schedules</li>
	<% } else { %>
	<li><i class="fa fa-calendar"></i><%= project.get('short_name') %> Schedules</li>
	<% } %>
	<% } else { %>
	<li><i class="fa fa-calendar"></i>All Schedules</li>
	<% } %>
</ol>

<div id="schedule-filters"></div>
<br />

<% if (project) { %>
<div class="btn-option">
	<button id="add-new-schedule" class="btn btn-primary"><i class="fa fa-plus"></i>Add New Schedule</button>
</div>
<% } %>
<div style="clear:both"></div>

<div id="schedules-list">
	<div align="center"><i class="fa fa-spinner fa-spin fa-2x"></i><br/>Loading schedules...</div>
</div>

<div class="buttons">
	<button id="cancel" class="btn btn-large"><i class="fa fa-times"></i>Cancel</button>
</div>
