<form action="/" class="form-horizontal">
	<fieldset>
		<legend>Package info</legend>
		<div class="control-group">
			<label class="required control-label">Name</label>
			<div class="controls">
				<input type="text" name="name" id="name" maxlength="100" class="required" data-toggle="popover" data-placement="right" title="Name" data-content="The name of your software package, excluding the version." value="<%= model.get('name') %>" />
			</div>
		</div>

		<div class="control-group">
			<label class="control-label">Description</label>
			<div class="controls">
				<textarea id="description" name="description" rows="3" maxlength="200" data-toggle="popover" data-placement="left" title="Description" data-content="Please include a short description of your package. "><%= model.get('description') %></textarea>
			</div>
		</div>

		<div class="control-group">
			<label class="control-label">External URL</label>
			<div class="controls">
				<input id="external-url" name="external-url" type="text" class="external-url" data-toggle="popover" data-placement="right" title="External URL" data-content="The External URL is the address from which the SWAMP will attempt to clone or pull files for the package. Currently, only publicly clonable GitHub repository URLs are allowed. You may copy the URL from the &quot;HTTPS clone URL&quot; displayed on your GitHub repository page. The default branch will be used. Example: https://github.com/htcondor/htcondor.git" />
			</div>
		</div>
	</fieldset>
	
	<fieldset>
		<legend>Package version info</legend>
		<div id="new-package-version-profile-form"></div>
	</fieldset>
</form>
