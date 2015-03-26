<form action="/" class="form-horizontal">
	<fieldset>
		<legend>Python build info</legend>

		<div class="control-group">
			<label class="required control-label">Build system</label>
			<div class="controls">
				<select id="build-system" name="build-system" data-toggle="popover" data-placement="right" title="Build system" data-content="This is the name of the system used to build the package (i.e. 'make' etc)." >
					<option value="none"></option>
					<option <% if (build_system == 'none') { %> selected <% } %> 
						value="no-build">No build</option>
					<option <% if (build_system == 'distutils') { %> selected <% } %>
						value="distutils">Build with DistUtils</option>
					<option <% if (build_system == 'other') { %> selected <% } %>
						value="other">Build (Other)</option>
				</select>
			</div>
		</div>

		<div class="control-group" <% if (build_system != 'other') { %> style="display:none" <% } %> >
			<label class="required control-label">Build command</label>
			<div class="controls">
				<input id="other-build-command" type="text" class="required" maxlength="200" value="<%= build_cmd %>" data-toggle="popover" data-placement="right" title="Build command" data-content="The command to run to compile your package (e.g. gcc -c *.c)" />
			</div>
		</div>

		<div class="control-group">
			<% var showAdvanced = (config_dir || config_cmd || config_opt || build_dir || build_file || build_opt || build_target); %>
			<div class="accordion" id="advanced-settings-accordion" <% if (build_system == 'none') { %> style="display:none" <% } %> >
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
							<label class="control-label">Build path</label>
							<div class="controls">
								<input id="build-path" type="text" maxlength="200" value="<%= build_dir %>" data-toggle="popover" data-placement="right" title="Build path" data-content="The path to run the build system from, relative to the package path.  If no path is provided, '.' is assumed." />
								<button id="select-build-path" class="btn"><i class="fa fa-list"></i>Select</button>
							</div>
						</div>

						<div class="control-group">
							<label class="control-label">Build file</label>
							<div class="controls">
								<input id="build-file" type="text" maxlength="200" <% if (build_file) { %> value="<%= build_file %>" <% } %>data-toggle="popover" data-placement="right" title="Build file" data-content="The path to the file containing instructions used by the build system, relative to the build path.  If no file is specified, then the system will search the build path for a file with a name that is standard for the build system that you are using (i.e. 'Makefile' for make etc.)" />
								<button id="select-build-file" class="btn"><i class="fa fa-list"></i>Select</button>
							</div>
						</div>

						<div class="control-group">
							<label class="control-label">Build options</label>
							<div class="controls">
								<input id="build-options" type="text" maxlength="200" value="<%= build_opt %>" data-toggle="popover" data-placement="right" title="Build options" data-content="The options and arguments to pass to the build system." />
							</div>
						</div>

						<div class="control-group">
							<label class="control-label">Build target</label>
							<div class="controls">
								<input id="build-target" type="text" maxlength="200" value="<%= build_target %>" data-toggle="popover" data-placement="right" title="Build target" data-content="The name of the file to be created by the build system.  If no target is provided, then the default target specified by the build file will be used." />
							</div>
						</div>

					</div>
				</div>
			</div>
		</div>
	</fieldset>
</form>







