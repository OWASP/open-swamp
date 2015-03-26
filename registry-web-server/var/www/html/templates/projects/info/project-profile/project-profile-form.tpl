<form action="/" class="form-horizontal">
	<div class="control-group">
		<label class="required control-label">Full name</label>
		<div class="controls">
			<input type="text" name="full-name" id="full-name" value="<%= full_name %>" class="required" data-toggle="popover" data-placement="right" title="Full name" data-content="The project full name is the long version of your project's name used in project descriptions." />
		</div>
	</div>
	
	<div class="control-group">
		<label class="required control-label">Short name</label>
		<div class="controls">
			<input type="text" name="short-name" id="short-name" value="<%= short_name %>" class="required" data-toggle="popover" data-placement="right" title="Short name" data-content="The project short name or alias is the short version of your project's name used in the sidebar." />
		</div>
	</div>

	<div class="control-group" style="display:none">
		<label class="required control-label pull-left">Project type</label>
		<br />
		<div class="controls well">
			<% for (var i = 0; i < Project.prototype.projectTypeCodes.length; i++) { %>
			<div>
				<input type="radio" class="project-type" name="project-type" id="<%= Project.prototype.projectTypeCodes[i] %>" value="software-package" <% if (project_type_code == Project.prototype.projectTypeCodes[i]) { %>checked<% } %> />
				<label class="control-label" for="software-package"><%= Project.prototype.projectTypeCodeToStr(Project.prototype.projectTypeCodes[i]) %></label>
			</div>
			<br />
			<% } %>
		</div>
		<div class="clearfix"></div>
	</div>

	<div class="control-group">
		<label class="required control-label">Description</label>
		<div class="controls">
			<textarea rows="6" name="description" maxlength="500" id="description" class="required" data-toggle="popover" data-placement="left" title="Description" data-content="Please include a short description of your project."><%= description %></textarea>
		</div>
	</div>

	<div align="right">
		<h3><span class="required"></span>Fields are required</h3>
	</div>
</form>
