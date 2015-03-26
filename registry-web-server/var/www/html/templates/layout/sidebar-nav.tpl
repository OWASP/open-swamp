<%
function opposite(side) {
	if (side == 'right') {
		return 'left';
	} else {
		return 'right';
	}
}
%>

<% if (showHome) { %>
<div class="active tile well<% if (nav == 'home') { %> selected<% } %>" id="home" data-placement="<%= opposite(orientation) %>" data-content="Home" data-container="body">
	<i class="fa fa-home"></i>
</div>
<% } %>

<div class="active tile well<% if (nav == 'packages') { %> selected<% } %>" id="packages" data-placement="<%= opposite(orientation) %>" data-content="Packages" data-container="body">
	<i class="fa fa-gift"></i>
</div>

<div class="active tile well<% if (nav == 'assessments') { %> selected<% } %>" id="assessments" data-placement="<%= opposite(orientation) %>" data-content="Assessments" data-container="body">
	<i class="fa fa-check"></i>
</div>

<div class="active tile well<% if (nav == 'results') { %> selected<% } %>" id="results" data-placement="<%= opposite(orientation) %>" data-content="Assessment Results" data-container="body">
	<i class="fa fa-bug"></i>
</div>

<div class="active tile well<% if (nav == 'runs') { %> selected<% } %>" id="runs" data-placement="<%= opposite(orientation) %>" data-content="Scheduled Runs" data-container="body">
	<i class="fa fa-bus"></i>
</div>

<div class="active tile well<% if (nav == 'projects') { %> selected<% } %>" id="projects" data-placement="<%= opposite(orientation) %>" data-content="Projects" data-container="body">
	<i class="fa fa-folder-open"></i>
</div>

<div class="active tile well<% if (nav == 'events') { %> selected<% } %>" id="events" data-placement="<%= opposite(orientation) %>" data-content="Events" data-container="body">
	<i class="fa fa-bullhorn"></i>
</div>

<% if (isAdmin) { %>
<div class="active tile well<% if (nav == 'settings') { %> selected<% } %>" id="settings" data-placement="<%= opposite(orientation) %>" data-content="System Settings" data-container="body">
	<i class="fa fa-gears"></i>
</div>

<div class="active tile well<% if (nav == 'overview') { %> selected<% } %>" id="overview" data-placement="<%= opposite(orientation) %>" data-content="System Overview" data-container="body">
	<i class="fa fa-eye"></i>
</div>
<% } %>

<div class="tile well last">
	<% if (typeof(orientation) != 'undefined' && orientation == 'left') { %>
	<div class="row-fluid icons" align="center">
		<% if (typeof(size) != 'undefined' && size == 'large') { %>
		<i id="minimize-nav" class="active fa fa-search-minus" data-placement="right" data-content="Minimize navigation bar" data-container="body"></i>
		<% } else { %>
		<i id="maximize-nav" class="active fa fa-search-plus" data-placement="right" data-content="Maximize navigation bar" data-container="body"></i>
		<% } %>
		<i id="top-nav" class="active fa fa-toggle-up" data-placement="right" data-content="Switch to top navigation bar" data-container="body"></i>
		<i id="right-nav" class="active fa fa-toggle-right" data-placement="right" data-content="Switch to right navigation bar" data-container="body"></i>
	</div>
	<% } else { %>
	<div class="row-fluid icons" align="center">
		<i id="left-nav" class="active fa fa-toggle-left" data-placement="left" data-content="Switch to left navigation bar" data-container="body"></i>
		<i id="top-nav" class="active fa fa-toggle-up" data-placement="left" data-content="Switch to top navigation bar" data-container="body"></i>
		<% if (typeof(size) != 'undefined' && size == 'large') { %>
		<i id="minimize-nav" class="active fa fa-search-minus" data-placement="left" data-content="Minimize navigation bar" data-container="body"></i>
		<% } else { %>
		<i id="maximize-nav" class="active fa fa-search-plus" data-placement="left" data-content="Maximize navigation bar" data-container="body"></i>
		<% } %>
	</div>
	<% } %>
</div>


