<div id="package-profile">

	<div class="control-group">
		<label class="form-label">Name</label>
		<span><%= name %></span>
	</div>

	<% if (package_type) { %>
	<div class="control-group">
		<label class="form-label">Language</label>
		<span><%= package_type %></span>
	</div>
	<% } %>

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

	<div class="control-group">
		<label class="form-label">External URL</label>
		<span><%= external_url? external_url : 'none' %></span>
	</div>

	<div class="control-group">
		<label class="form-label">Description</label>
		<span><%= description? description : 'none' %></span>
	</div>
</div>
