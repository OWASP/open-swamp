<div class="control-group">
	<label class="form-label">Package</label>
	<span><%= package.get('name') %></span>
</div>

<% if (version_string) { %>
<div class="control-group">
	<label class="form-label">Version</label>
	<span><%= version_string %></span>
</div>
<% } %>

<div class="control-group">
	<label class="form-label">Filename</label>
	<span><%= filename %></span>
</div>

<fieldset>
	<legend>Dates</legend>

	<% if (model.hasCreateDate()) { %>
	<div class="control-group">
		<label class="form-label">Creation date</label>
		<span><%= displayDate(model.getCreateDate()) %></span>
	</div>
	<% } %>

	<% if (model.hasUpdateDate()) { %>
	<div class="control-group">
		<label class="form-label">Last modified date</label>
		<span><%= displayDate(model.getUpdateDate()) %></span>
	</div>
	<% } %>

	<% if (model.has('release_date')) { %>
	<div class="control-group">
		<label class="form-label">Release date</label>
		<span><%= displayDate(model.get('release_date')) %></span>
	</div>
	<% } %>

	<% if (model.has('retire_date')) { %>
	<div class="control-group">
		<label class="form-label">Retire date</label>
		<span><%= displayDate(model.get('retire_date')) %></span>
	</div>
	<% } %>
</fieldset>

<div class="control-group">
	<label class="form-label">Version notes</label>
	<span><%= typeof(notes) != 'undefined' && notes? notes : 'none' %></span>
</div>
