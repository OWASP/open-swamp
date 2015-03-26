<form action="/" class="form-horizontal">
	<div class="control-group">
		<label class="required control-label">Name</label>
		<div class="controls">
			<input type="text" name="name" id="name" value="<%= name %>" class="required" data-toggle="popover" data-placement="right" title="Name" data-content="The name is what this schedule is called." />
		</div>
	</div>

	<div class="control-group">
		<label class="required control-label">Description</label>
		<div class="controls">
			<textarea name="description" id="description" class="required" data-toggle="popover" data-placement="left" title="Description" data-content="Please include a short description of this schedule."><%= description %></textarea>
		</div>
	</div>

	<div align="right">
		<h3><span class="required"></span>Fields are required</h3>
	</div>
</form>
