<form action="/" class="form-horizontal">
	<div class="control-group">
		<label class="required control-label">Version</label>
		<div class="controls">
			<input type="text" name="version-string" id="version-string" maxlength="100" value="<%= model.get('version_string') %>" class="required" data-toggle="popover" data-placement="right" title="Version" data-content="An optional string, number, or code that uniquely identifies this particular version of the software." />
		</div>
	</div>

	<div class="control-group">
		<label class="control-label">Tool directory</label>
		<div class="controls">
			<input type="text" name="tool-directory" id="tool-directory" maxlength="200" value="<%= model.get('tool_directory') %>" data-toggle="popover" data-placement="right" title="Tool directory" data-content="The optional name of the top level directory when the file is extracted. If no path is provided, the root of the extracted directory tree will be used." />
		</div>
	</div>

	<fieldset>
		<legend>Execution</legend>
		<div class="control-group">
			<label class="required control-label">Tool executable</label>
			<div class="controls">
				<input type="text" name="tool-executable" id="tool-executable" maxlength="200" class="required" value="<%= model.get('tool_executable') %>" data-toggle="popover" data-placement="right" title="Tool executable" data-content="The name of the executable to run to invoke the tool." />
			</div>
		</div>
		<div class="control-group">
			<label class="control-label">Tool arguments</label>
			<div class="controls">
				<input type="text" name="tool-arguments" id="tool-arguments" maxlength="200" value="<%= model.get('tool_arguments') %>" data-toggle="popover" data-placement="right" title="Tool arguments" data-content="The arguments to pass into the tool when it is executed." />
			</div>
		</div>
	</fieldset>

	<fieldset>
		<legend>Notes</legend>
		<div class="control-group">
			<label class="control-label">Notes</label>
			<div class="controls">
				<textarea rows="3" name="notes" id="notes" maxlength="200" data-toggle="popover" data-placement="left" title="Notes" data-content="Please include any version specific notes here."><%= model.get('notes') %></textarea>
			</div>
		</div>
	</fieldset>

	<div align="right">
		<h3><span class="required"></span>Fields are required</h3>
	</div>
</form>
