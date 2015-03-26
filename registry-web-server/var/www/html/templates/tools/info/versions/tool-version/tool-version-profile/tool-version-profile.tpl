<div class="control-group">
	<label class="form-label">Version</label>
	<span><%= version_string %></span>
</div>

<div class="control-group">
	<label class="form-label">Package types supported</label>
	<span><%= package_type_names %></span>
</div>
	
<% if (model.hasCreateDate()) { %>
<div class="control-group">
	<label class="form-label">Creation date</label>
	<span><%= displayDate(model.getCreateDate()) %></span>
</div>
<% } %>

<% if (model.hasUpdateDate()) { %>
<div class="control-group" style="display:none">
	<label class="form-label">Last modified</label>
	<span><%= displayDate(model.getUpdateDate()) %></span>
</div>
<% } %>

<% if (typeof(tool_directory) != 'undefined') { %>
<div class="control-group">
	<label class="form-label">Tool directory</label>
	<span><%= tool_directory %></span>
</div>
<% } %>

<% if (typeof(tool_executable) != 'undefined') { %>
<fieldset>
	<legend>Execution</legend>
	<div class="control-group">
		<label class="form-label">Tool executable</label>
		<span><%= tool_executable %></span>
	</div>
	<div class="control-group">
		<label class="form-label">Tool arguments</label>
		<span><%= tool_arguments %></span>
	</div>
</fieldset>
<% } %>

<% if (typeof(notes) != 'undefined') { %>
<fieldset>
	<legend>Notes</legend>
	<div class="control-group">
		<label class="form-label">Notes</label>
		<span><%= notes %></span>
	</div>
</fieldset>
<% } %>
