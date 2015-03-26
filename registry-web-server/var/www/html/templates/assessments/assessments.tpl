<h1>
	<div><i class="fa fa-check"></i></div>
	<% if (project) { %>
	<% if (project.isTrialProject()) { %>
	My Assessments
	<% } else { %>
	Project <span class="name"><%= project.get('short_name') %></span> Assessments
	<% } %>
	<% } else { %>
	Assessments
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
	<li><i class="fa fa-check"></i>My Assessments</li>
	<% } else { %>
	<li><i class="fa fa-check"></i><%= project.get('short_name') %> Assessments</li>
	<% } %>
	<% } else { %>
	<li><i class="fa fa-check"></i>Assessments</li>
	<% } %>
</ol>

<% if (showNavigation) { %>
<ul class="well nav nav-pills">
	<li><a id="results"><i class="fa fa-bug"></i>Results</a></li>
	<li><a id="runs"><i class="fa fa-bus"></i>Runs</a></li>
</ul>
<% } %>

<p>Assessments are triplets of package, tool, and platform identifiers that together specify an assessment to be run.  To run or schedule an assessment, select one or more assessments from the list below or create a new assessment. </p>

<div id="assessment-filters"></div>
<br />

<div class="btn-option">
	<button id="run-new-assessment" class="btn"><i class="fa fa-play"></i>Run New Assessment</button>
</div>
<div style="clear:both"></div>

<div id="select-assessments-list">
	<div align="center"><i class="fa fa-spinner fa-spin fa-2x"></i><br/>Loading assessments...</div>
</div>

<br />
<label class="checkbox">
	Show numbering
	<input type="checkbox" id="show-numbering" <% if (showNumbering) { %>checked<% } %> />
</label>

<div class="buttons">
	<button id="run-assessments" class="btn btn-primary btn-large"><i class="fa fa-play"></i>Run Assessments</button>
	<button id="schedule-assessments" class="btn btn-large"><i class="fa fa-calendar"></i>Schedule Assessments</button>
	<button id="delete-assessments" class="btn btn-large"><i class="fa fa-trash"></i>Delete Assessments</button>
</div>


