<h1><div><i class="fa fa-folder-open"></i></div>Project <span class="name"><%= short_name %></span></h1>

<ol class="breadcrumb">
	<li><a href="#home"><i class="fa fa-home"></i>Home</a></li>
	<li><a href="#projects"><i class="fa fa-folder-open"></i>Projects</a></li>
	<li><i class="fa fa-folder-open"></i>Project <%= model.get('short_name') %></li>
</ol>

<ul class="well nav nav-pills">
	<li><a id="assessments"><i class="fa fa-check"></i>Assessments</a></li>
	<li><a id="results"><i class="fa fa-bug"></i>Results</a></li>
	<li><a id="runs"><i class="fa fa-bus"></i>Runs</a></li>
	<li><a id="schedules"><i class="fa fa-calendar"></i>Schedules</a></li>
	<li><a id="events"><i class="fa fa-bullhorn"></i>Events</a></li>
</ul>

<div class="well">
	<div id="project-profile"></div>
</div>

<h2>Members</h2>
<div class="btn-option">
	<button id="invite" class="btn"><i class="fa fa-envelope"></i>Invite New Members</button>
</div>
<p>The following SWAMP users are members of project <%= full_name %>.</p>
<div style="clear:both"></div>

<div id="members-list">
	<div align="center"><i class="fa fa-spinner fa-spin fa-2x"></i><br/>Loading project members...</div>
</div>

<div class="buttons">
	<button id="run-new-assessment" class="btn btn-primary btn-large"><i class="fa fa-play"></i>Run New Assessment</button>
	<% if (isOwned) { %>
	<button id="edit-project" class="btn btn-large"><i class="fa fa-pencil"></i>Edit Project</button>
	<button id="delete-project" class="btn btn-large"><i class="fa fa-trash"></i>Delete Project</button>
	<% } %>
	<% if (isProjectAdmin && !isTrialProject) { %>
	<button id="save-changes" class="btn btn-large"><i class="fa fa-plus"></i>Save Changes</button>
	<% } %>
	<button id="cancel" class="btn btn-large"><i class="fa fa-times"></i>Cancel</button>
</div>
