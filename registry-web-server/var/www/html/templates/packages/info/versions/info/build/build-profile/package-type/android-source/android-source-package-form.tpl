<form action="/" class="form-horizontal">
	<fieldset>
		<legend>Android source build info</legend>

		<div class="control-group">
			<label class="required control-label">Build system</label>
			<div class="controls">
				<select id="build-system" name="build-system" data-toggle="popover" data-placement="right" title="Build System" data-content="This is the name of the system used to build the package (i.e. 'ant' etc)." >
					<option <% if (build_system == 'ant') { %> selected <% } %>
						value="ant">Ant</option>
				</select>
			</div>
		</div>

		<div class="control-group">
			<label class="control-label">Build target</label>
			<div class="controls">
				<select id="build-target" name="build-target" data-toggle="popover" data-placement="right" title="Build System" data-content="This is the name of the target that is created during the build." >
					<option <% if (build_target == 'release' || build_target == undefined) { %> selected <% } %>
						value="release">release</option>
					<option <% if (build_target == 'debug') { %> selected <% } %> 
						value="debug">debug</option>
					<option <% if (build_target != 'release' && build_target != 'debug' && build_target != undefined) { %> selected <% } %>
						value="other">other</option>
				</select>
			</div>
		</div>

		<div class="control-group" <% if (build_target == 'debug' || build_target == 'release' || build_target == undefined) { %> style="display:none"<% } %> >
			<label class="control-label">Other build target</label>
			<div class="controls">
				<input id="other-build-target" type="text" <% if (build_target != 'debug' && build_target != 'release') { %> value="<%= build_target %>" <% } %> data-toggle="popover" data-placement="right" title="Build target" data-content="This is the name of the target that is created during the build." />
			</div>
		</div>

		<div class="control-group">
			<% var showAdvanced = (android_sdk_target || android_redo_build || config_dir || config_cmd || config_opt || build_dir || build_file || build_opt); %>
			<div class="accordion" id="advanced-settings-accordion" <% if (build_system == 'no-build') { %> style="display:none" <% } %> >
				<div class="accordion-group">
					<div class="accordion-heading">
						<label>
						<a class="accordion-toggle" data-toggle="collapse" data-parent="#advanced-settings-accordion" href="#advanced-settings">
							<% if (showAdvanced) { %>
							<i class="fa fa-minus-circle"></i>
							<% } else { %>
							<i class="fa fa-plus-circle"></i>
							<% } %>
							Advanced settings
						</a>
						</label>
					</div>
					<div id="advanced-settings" class="nested accordion-body collapse<% if (showAdvanced) { %> in<% } %>">

						<div class="control-group">
							<label class="control-label">Android SDK target</label>
							<input id="android-sdk-target" type="text" value="<%= android_sdk_target %>" data-toggle="popover" data-placement="right" title="Android SDK Target" data-content="This is a string that describes the target Android SDK version." />
						</div>
						
						<div class="control-group">
							<label class="control-label">Android redo build</label>
							<input id="android-redo-build" type="checkbox" data-toggle="popover" data-placement="right" title="Android Redo Build" data-content="This is a whether or not to attempt to infer the manifest file and redo the build from the package contents." <% if (android_redo_build) { %> checked <% } %> />
						</div>

						<div class="control-group">
							<label class="control-label">Configure path</label>
							<div class="controls">
								<input id="configure-path" type="text" maxlength="200" value="<%= config_dir %>" data-toggle="popover" data-placement="right" title="Configure path" data-content="The optional path to run the configure command from, relative to the package path. If no path is provided, '.' is assumed." />
								<button id="select-configure-path" class="btn"><i class="fa fa-list"></i>Select</button>
							</div>
						</div>

						<div class="control-group">
							<label class="control-label">Configure command</label>
							<div class="controls">
								<input id="configure-command" type="text" maxlength="200" value="<%= config_cmd %>" data-toggle="popover" data-placement="right" title="Configure command" data-content="The optional command to run before the build system is invoked." />
							</div>
						</div>

						<div class="control-group">
							<label class="control-label">Configure options</label>
							<div class="controls">
								<input id="configure-options" type="text" maxlength="200" value="<%= config_opt %>" data-toggle="popover" data-placement="right" title="Configure options" data-content="The arguments to pass to the configure command." />
							</div>
						</div>

						<div class="control-group">
							<label class="control-label">Build path</label>
							<div class="controls">
								<input id="build-path" type="text" maxlength="200" value="<%= build_dir %>" data-toggle="popover" data-placement="right" title="Build Path" data-content="The path to run the build system from, relative to the package path.  If no path is provided, '.' is assumed." />
								<button id="select-build-path" class="btn"><i class="fa fa-list"></i>Select</button>
							</div>
						</div>

						<div class="control-group">
							<label class="control-label">Build file</label>
							<div class="controls">
								<input id="build-file" type="text" maxlength="200" <% if (build_file) { %> value="<%= build_file %>" <% } %>
							 data-toggle="popover" data-placement="right" title="Build file" data-content="The path to the file containing instructions used by the build system, relative to the build path.  If no file is specified, then the system will search the build path for a file with a name that is standard for the build system that you are using (i.e. 'build.xml' for Ant, 'pom.xml' for Maven etc.)" />
							 <button id="select-build-file" class="btn"><i class="fa fa-list"></i>Select</button>
							</div>
						</div>

						<div class="control-group">
							<label class="control-label">Build options</label>
							<div class="controls">
								<input id="build-options" type="text" maxlength="200" value="<%= build_opt %>" data-toggle="popover" data-placement="right" title="Build Options" data-content="The options and arguments to pass to the build system." />
							</div>
						</div>

					</div>
				</div>
			</div>
		</div>
	</fieldset>
</form>