<div id="android-source-package-info">
	<fieldset>
		<legend>Android source build info</legend>

		<div class="control-group">
			<label class="form-label">Build system</label>
			<span><%= build_system %></span>
		</div>

		<% if (build_target) { %> 
		<div class="control-group">
			<label class="form-label">Build target</label>
			<span><%= build_target %></span>
		</div>
		<% } %>

		<br />
		<div class="control-group">
			<% var showAdvanced = (android_sdk_target || android_redo_build || config_dir || config_cmd || config_opt || build_dir || build_file || build_opt); %>
			<div class="accordion" id="advanced-settings-accordion">
				<div class="accordion-group">
					<div class="accordion-heading">
						<label>
						<a class="accordion-toggle" data-toggle="collapse" data-parent="#advanced-settings-accordion" href="#advanced-settings">
							<i class="fa fa-minus-circle"></i>
							Advanced settings
						</a>
						</label>
					</div>
					<div id="advanced-settings" class="nested accordion-body collapse in">
						<% if (showAdvanced) { %>

						<% if (android_sdk_target) { %>
						<div class="control-group">
							<label class="form-label">Android SDK target</label>
							<span>
							<% if (typeof android_sdk_target != "undefined") { %>
							<%= android_sdk_target %>
							<% } %>
							</span>
						</div>
						<% } %>

						<% if (android_redo_build) { %>
						<div class="control-group">
							<label class="form-label">Android redo build</label>
							<span>
							<%= typeof android_redo_build != "undefined" && android_redo_build == '1'?  'yes' : 'no' %>
							</span>
						</div>
						<% } %>

						<% if (config_dir) { %>
						<div class="control-group">
							<label class="form-label">Configure path</label>
							<span><%= config_dir %></span>
						</div>
						<% } %>

						<% if (config_cmd) { %>
						<div class="control-group">
							<label class="form-label">Configure command</label>
							<span><%= config_cmd %></span>
						</div>
						<% } %>

						<% if (config_opt) { %>
						<div class="control-group">
							<label class="form-label">Configure options</label>
							<span><%= config_opt %></span>
						</div>
						<% } %>

						<% if (build_dir) { %> 
						<div class="control-group">
							<label class="form-label">Build path</label>
							<span><%= build_dir %></span>
						</div>
						<% } %>

						<% if (build_file) { %> 
						<div class="control-group">
							<label class="form-label">Build file</label>
							<span><%= build_file %></span>
						</div>
						<% } %>

						<% if (build_opt) { %> 
						<div class="control-group">
							<label class="form-label">Build options</label>
							<span><%= build_opt %></span>
						</div>
						<% } %>

						<% } else { %>
						<p>No advanced settings have been defined. </p>
						<% } %>
					</div>
				</div>
			</div>
		</div>

	</fieldset>
</div>