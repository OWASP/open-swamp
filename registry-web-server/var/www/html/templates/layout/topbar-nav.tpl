<div class="well">
	<ul class="nav nav-pills">
		<% if (showHome) { %>
		<li<% if (nav == 'home') {%> class="active" <% } %>>
			<a id="home" href="#"><i class="fa fa-home"></i>Home</a>
		</li>
		<% } %>

		<li<% if (nav == 'packages') {%> class="active" <% } %>>
			<a id="packages"><i class="fa fa-gift"></i>Packages</a>
		</li>

		<li<% if (nav == 'assessments') {%> class="active" <% } %>>
			<a id="assessments"><i class="fa fa-check"></i>Assessments</a>
		</li>
		<li<% if (nav == 'results') {%> class="active" <% } %>>
			<a id="results"><i class="fa fa-bug"></i>Results</a></li>
		<li<% if (nav == 'runs') {%> class="active" <% } %>>
			<a id="runs"><i class="fa fa-bus"></i>Runs</a>
		</li>
		
		<li<% if (nav == 'projects') {%> class="active" <% } %>>
			<a id="projects"><i class="fa fa-folder-open"></i>Projects</a>
		</li>
		<li<% if (nav == 'events') {%> class="active" <% } %>>
			<a id="events"><i class="fa fa-bullhorn"></i>Events</a>
		</li>
		
		<% if (isAdmin) { %>
		<li<% if (nav == 'settings') {%> class="active" <% } %>>
			<a id="settings"><i class="fa fa-gears"></i>Settings</a>
		</li>
		<li<% if (nav == 'overview') {%> class="active" <% } %>>
			<a id="overview"><i class="fa fa-eye"></i>Overview</a>
		</li>
		<% } %>

		<div class="icons">
			<i id="side-nav" class="active fa fa-toggle-left pull-right" data-placement="bottom" data-content="Switch to side navigation bar" data-container="body"></i>
		</div>
	</ul>
</div>
