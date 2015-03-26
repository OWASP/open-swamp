<div class="row-fluid" align="center">
	<br />
	<img id="logo" width="400px" src="images/logos/swamp-logo-large.png" alt="logo" style="margin-right:100px"/>
	<br /><br />
	<div class="tagline">Do It Early. Do It Often.</div>
</div>
<br /><br />

<div class="dashboard nav row-fluid variable-columns">
	<div class="active span4" id="packages">
		<h2><div><i class="fa fa-gift"></i></div>Packages</h2>
		<p>Create and manage your software packages and upload your code for assessment.</p>
	</div>

	<div class="active span4" id="assessments">
		<h2><div><i class="fa fa-check"></i></div>Assessments</h2>
		<p>Perform assessments on a software package using our software analysis tools.</p>
	</div>

	<div class="active span4" id="results">
		<h2><div><i class="fa fa-bug"></i></div>Results</h2>
		<p>View assessments' status and the results of completed assessments.</p><br />
	</div>
	
	<div class="active span4" id="runs">
		<h2><div><i class="fa fa-bus"></i></div>Runs</h2>
		<p>View assessments that are scheduled to run periodically at regular intervals.</p>
	</div>

	<div class="active span4" id="projects">
		<h2><div><i class="fa fa-folder-open"></i></div>Projects</h2>
		<p>Create and manage projects to share assessment results with other SWAMP users.</p>
	</div>

	<div class="active span4" id="events">
		<h2><div><i class="fa fa-bullhorn"></i></div>Events</h2>
		<p>View the events associated with your user account and projects.</p>
		<br />
	</div>

	<% if (isAdmin) { %>
	<div class="active span4" id="settings">
		<h2><div><i class="fa fa-gears"></i></div>Settings</h2>
		<p>Review and modify SWAMP system wide settings.</p>
	</div>

	<div class="active span4" id="overview">
		<h2><div><i class="fa fa-eye"></i></div>Overview</h2>
		<p>Monitor SWAMP system wide activity.</p>
	</div>
	<% } %>
</div>

