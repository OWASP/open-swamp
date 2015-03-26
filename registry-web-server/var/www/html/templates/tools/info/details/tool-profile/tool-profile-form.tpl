<form action="/" class="form-horizontal">
	<div class="control-group">
		<label class="required control-label">Name</label>
		<div class="controls">
			<input type="text" name="name" id="name" maxlength="100" class="required" data-toggle="popover" data-placement="right" title="Name" data-content="The name of your software tool, excluding the version." value="<%= model.get('name') %>" />
		</div>
	</div>

	<div class="control-group" style="display:none">
		<label class="required control-label">Is build needed</label>
		<input id="is-build-needed" type="checkbox" data-toggle="popover" data-placement="right" title="Is build needed" data-content="The flag determines whether this tool operates upon the output of a build (such as Java bytecode) or source code."
		<% if (model.get('is_build_needed') == "1") { %>
			checked
		<% } %>
		/>
	</div>

	<div align="right">
		<h3><span class="required"></span>Fields are required</h3>
	</div>
</form>
