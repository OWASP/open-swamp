<form action="/" class="form-horizontal">
	<fieldset>
		<legend>Java bytecode info</legend>

		<div class="control-group">
			<label class="required control-label">Class path</label>
			<div class="controls">
				<textarea id="class-path" rows="3" class="required" data-toggle="popover" data-placement="left" title="Class path" data-content="A ‘:’ separated list of paths to Java archive files (jar, zip, war, ear files), class files or directories containing class files that are to be assessed. For a directory, all the class files in the directory tree are assessed. Additionally, a directory path can end with a wildcard character ‘*’, in that case all the jar files in the directory are assessed. These paths are relative to the package path.
"><%= (bytecode_class_path? bytecode_class_path : '.')%></textarea>
				<br />
				<button id="add-class-path" class="btn" style="margin-top:5px; margin-left:15px"><i class="fa fa-list"></i>Add</button>
			</div>
		</div>

		<div class="control-group">
			<% var showAdvanced = (bytecode_aux_class_path || bytecode_source_path); %>
			<div class="accordion" id="advanced-settings-accordion">
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
							<label class="control-label">Aux class path</label>
							<div class="controls">
								<textarea id="aux-class-path" rows="3" data-toggle="popover" data-placement="left" title="Aux class path" data-content="A ‘:’ separated list of paths to Java archive files (jar, zip, war, ear files), class files or directories containing class files that are referenced by the bytecode in the package-classpath. These files are not assessed by a swa-tool. For a directory, all the class files in the directory tree are included. Additionally, a directory path can end with a wildcard character ‘*’, in that case all the jar files in the directory are included. These paths are relative to the package path."
"><%= bytecode_aux_class_path %></textarea>
								<br />
								<button id="add-aux-class-path" class="btn" style="margin-top:5px; margin-left:25px"><i class="fa fa-list"></i>Add</button>
							</div>
						</div>

						<div class="control-group">
							<label class="control-label">Source path</label>
							<div class="controls">
								<textarea id="source-path" rows="3" data-toggle="popover" data-placement="left" title="Source path" data-content="A ‘:’ separated list of paths to directories containing source files for the bytecode in the classpath. For the source information to be present in the assessment reports, the bytecode in package-classpath must be compiled with debugging information (see javac -g option). These paths are relative to the package path. "><%= bytecode_source_path %></textarea>
								<br />
								<button id="add-source-path" class="btn" style="margin-top:5px; margin-left:25px"><i class="fa fa-list"></i>Add</button>
							</div>
						</div>

					</div>
				</div>
			</div>
		</div>
	</fieldset>
</form>
