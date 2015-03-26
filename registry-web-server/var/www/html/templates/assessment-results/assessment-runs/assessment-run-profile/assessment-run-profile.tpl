<div id="project-profile">

	<fieldset>
		<legend>Assessment</legend>

		<div class="control-group">
			<label class="form-label">Package</label>
			<span class="name"><%= model.get('package').name %></span>
			<span class="version label"><%= model.get('package').version_string %></span>
		</div>

		<div class="control-group">
			<label class="form-label">Tool</label>
			<span class="name"><%= model.get('tool').name %></span>
			<span class="version label"><%= model.get('tool').version_string %></span>
		</div>

		<div class="control-group">
			<label class="form-label">Platform</label>
			<span class="name"><%= model.get('platform').name %></span>
			<span class="version label"><%= model.get('platform').version_string %></span>
		</div>

		<div class="control-group">
			<label class="form-label">Status</label>
			<%= status %>
		</div>
	</fieldset>

	<fieldset>
		<legend>UUIDs</legend>

		<div class="control-group">
			<label class="form-label">Execution Record UUID</label>
			<span class="name"><%= model.get('execution_record_uuid') %></span>
		</div>

		<div class="control-group">
			<label class="form-label">Assessment Run UUID</label>
			<span class="name"><%= model.get('assessment_run_uuid') %></span>
		</div>

		<div class="control-group">
			<label class="form-label">Assessment Result UUID</label>
			<span class="name"><%= model.get('assessment_result_uuid') %></span>
		</div>
	</fieldset>

	<fieldset>
		<legend>Dates</legend>

		<div class="control-group">
			<label class="form-label">Create date</label>
			<% if (model.has('create_date')) { %>
			<%= detailedDate( model.get('create_date') ) %>
			<% } %>
		</div>

		<div class="control-group">
			<label class="form-label">Run date</label>
			<% if (model.has('run_date')) { %>
			<%= detailedDate( model.get('run_date') ) %>
			<% } else { %>
			has not run
			<% } %>
		</div>

		<div class="control-group">
			<label class="form-label">Completion date</label>
			<% if (model.has('completion_date')) { %>
			<%= detailedDate( model.get('completion_date') ) %>
			<% } else { %>
			not completed
			<% } %>
		</div>
	</fieldset>

	<fieldset>
		<legend>Statistics</legend>

		<div class="control-group">
			<label class="form-label">Execution duration</label>
			<% if (typeof execution_duration != 'undefined' && execution_duration != null) { %>
			<%= execution_duration %>
			<% } else { %>
			unknown
			<% } %>
		</div>

		<div class="control-group">
			<label class="form-label">Lines of code</label>
			<% if (typeof lines_of_code != 'undefined' && lines_of_code != null) { %>
			<%= lines_of_code %>
			<% } else { %>
			unknown
			<% } %>
		</div>
	</fieldset>
</div>
