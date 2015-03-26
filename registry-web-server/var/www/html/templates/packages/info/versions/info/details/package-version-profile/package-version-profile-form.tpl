<form action="/" class="form-horizontal">
	<div class="control-group">
		<label class="required control-label">Version</label>
		<div class="controls">
			<input id="version-string" class="required" name="version-string" type="text" maxlength="100" value="<%= model.get('version_string') %>" data-toggle="popover" data-placement="right" title="Version" data-content="An optional string, number, or code that uniquely identifies this particular version of the software." />
		</div>
	</div>

	<div class="control-group">
		<label class="control-label">Version notes</label>
		<div class="controls">
			<textarea id="notes" name="notes" rows="3" maxlength="200" data-toggle="popover" data-placement="left" title="Description" data-content="Please include any version specific notes here."><%= model.get('notes') %></textarea>
		</div>
	</div>

	<div align="right">
		<h3><span class="required"></span>Fields are required</h3>
	</div>
</form>
