<div class="control-group">
	<label class="form-label">Version</label>
	<span><%= version_string %></span>
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

<% if (typeof(notes) != 'undefined') { %>
<fieldset>
	<legend>Notes</legend>
	<div class="control-group">
		<label class="form-label">Notes</label>
		<span><%= notes %></span>
	</div>
</fieldset>
<% } %>
