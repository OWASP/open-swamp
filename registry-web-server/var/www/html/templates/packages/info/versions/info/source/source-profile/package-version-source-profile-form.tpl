<form action="/" class="form-horizontal">
	<div class="control-group">
		<label class="required control-label">Package path</label>
		<div class="controls">
			<input id="package-path" name="package-path" type="text" maxlength="200" class="required" value="<%= model.get('source_path') %>" data-toggle="popover" data-placement="right" title="Package path" data-content="This is the name of the directory / folder within the compressed package file that contains your package source code. " />
			<button id="select-package-path" class="btn"><i class="fa fa-list"></i>Select</button>
		</div>
	</div>
</form>