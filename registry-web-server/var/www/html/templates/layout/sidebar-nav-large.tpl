<% if (showHome) { %>
<div align="center">
	<a href="#"><img class="logo" width="75px" height="75px" src="images/icons/swamp-icon-small.png" /></a>
</div>
<% } %>

<div class="active tile well<% if (nav.contains('packages')) { %> selected<% } %>" id="packages">
	<div align="center">
		<i class="fa fa-gift fa-3x"></i>
		<label>Packages</label>
	</div>
</div>

<div class="active tile well<% if (nav.contains('assessments')) { %> selected<% } %>" id="assessments">
	<div align="center">
		<i class="fa fa-check fa-3x"></i>
		<label>Assessments</label>
	</div>
</div>

<div class="active tile well<% if (nav.contains('results')) { %> selected<% } %>" id="results">
	<div align="center">
		<i class="fa fa-bug fa-3x"></i>
		<label>Results</label>
	</div>
</div>

<div class="active tile well<% if (nav.contains('runs')) { %> selected<% } %>" id="runs">
	<div align="center">
		<i class="fa fa-bus fa-3x"></i>
		<label>Runs</label>
	</div>
</div>

<div class="active tile well<% if (nav.contains('projects')) { %> selected<% } %>" id="projects">
	<div align="center">
		<i class="fa fa-folder-open fa-3x"></i>
		<label>Projects</label>
	</div>
</div>

<div class="active tile well<% if (nav.contains('events')) { %> selected<% } %>" id="events">
	<div align="center">
		<i class="fa fa-bullhorn fa-3x"></i>
		<label>Events</label>
	</div>
</div>

<% if (isAdmin) { %>
<div class="active tile well<% if (nav.contains('settings')) { %> selected<% } %>" id="settings">
	<div align="center">
		<i class="fa fa-gears fa-3x"></i>
		<label>Settings</label>
	</div>
</div>

<div class="active tile well<% if (nav.contains('overview')) { %> selected<% } %>" id="overview">
	<div align="center">
		<i class="fa fa-eye fa-3x"></i>
		<label>Overview</label>
	</div>
</div>
<% } %>

<div class="tile well last">
	<% if (orientation == 'left') { %>
	<div class="row-fluid icons" align="center">
		<i id="minimize-nav" class="active fa fa-search-minus" data-placement="right" data-content="Minimize navigation bar." data-container="body"></i>
		<i id="top-nav" class="active fa fa-toggle-up" data-placement="right" data-content="Switch to top navigation bar." data-container="body"></i>
		<i id="right-nav" class="active fa fa-toggle-right" data-placement="right" data-content="Switch to right navigation bar." data-container="body"></i>
	</div>
	<% } else { %>
	<div class="row-fluid icons" align="center">
		<i id="left-nav" class="active fa fa-toggle-left" data-placement="left" data-content="Switch to left navigation bar." data-container="body"></i>
		<i id="top-nav" class="active fa fa-toggle-up" data-placement="left" data-content="Switch to top navigation bar." data-container="body"></i>
		<i id="minimize-nav" class="active fa fa-search-minus" data-placement="left" data-content="Minimize navigation bar." data-container="body"></i>
	</div>
	<% } %>
</div>


