<h1>
	<div><i class="fa fa-bus"></i></div>
	<% if (project) { %>
	<% if (project.isTrialProject()) { %>
	My Scheduled Runs
	<% } else { %>
	Project <span class="name"><%= project.get('short_name') %></span> Scheduled Runs
	<% } %>
	<% } else { %>
	Scheduled Runs
	<% } %>

	<% if (package) { %>
	of <span class="name"><%= package.get('name') %></span>
	<% } %>

	<% if (packageVersion) { %>
	Version <span class="name"><%= typeof(packageVersion) == 'string'? packageVersion.toTitleCase() : packageVersion.get('version_string') %></span>
	<% } %>

	<% if (tool) { %>
	using <span class="name"><%= tool.get('name') %></span>
	<% } %>

	<% if (toolVersion) { %>
	Version <span class="name"><%= typeof(toolVersion) == 'string'? toolVersion.toTitleCase() : toolVersion.get('version_string') %></span>
	<% } %>

	<% if (platform) { %>
	on <span class="name"><%= platform.get('name') %></span>
	<% } %>

	<% if (platformVersion) { %>
	Version <span class="name"><%= typeof(platformVersion) == 'string'? platformVersion.toTitleCase() : platformVersion.get('version_string') %></span>
	<% } %>
</h1>

<ol class="breadcrumb">
	<li><a href="#home"><i class="fa fa-home"></i>Home</a></li>

	<% if (project) { %>
	<% if (project.isTrialProject()) { %>
	<li><i class="fa fa-bus"></i>My Scheduled Runs</li>
	<% } else { %>
	<li><i class="fa fa-bus"></i><%= project.get('short_name') %> Scheduled Runs</li>
	<% } %>
	<% } else { %>
	<li><i class="fa fa-bus"></i>Scheduled Runs</li>
	<% } %>
</ol>

<% if (showNavigation) { %>
<ul class="well nav nav-pills">
	<li><a id="view-assessments"><i class="fa fa-check"></i>View Assessments</a></li>
	<li><a id="view-results"><i class="fa fa-bug"></i>View Results</a></li>
</ul>
<% } %>

<p>Assessment runs may be defined to occur on a recurring basis according to a schedule. Scheduled assessment runs will continue to periodically run as long as they exist so any unused runs should be deleted from this list.</p>

<div id="run-requests-filters"></div>
<br />

<div class="btn-option">
	<button id="add-new-scheduled-runs" class="btn"><i class="fa fa-plus"></i>Add New Scheduled Runs</button>
</div>
<div style="clear:both"></div>

<div id="run-requests-list">
	<div align="center"><i class="fa fa-spinner fa-spin fa-2x"></i><br/>Loading runs...</div>
</div>

<br />
<label class="checkbox">
	Show numbering
	<input type="checkbox" id="show-numbering" <% if (showNumbering) { %>checked<% } %> />
</label>

<div class="buttons">
	<button id="show-schedules" class="btn btn-primary btn-large"><i class="fa fa-calendar"></i>Show Schedules</button>
</div>