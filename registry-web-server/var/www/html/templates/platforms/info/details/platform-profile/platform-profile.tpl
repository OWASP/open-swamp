<div id="platform-profile">

	<div class="control-group">
		<label class="form-label">Platform name</label>
		<span><%= name %></span>
	</div>

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

	<% if (typeof(description) != 'undefined') { %>
	<div class="control-group">
		<label class="form-label">Description</label>
		<span><%= description %></span>
	</div>
	<% } %>
	
</div>
