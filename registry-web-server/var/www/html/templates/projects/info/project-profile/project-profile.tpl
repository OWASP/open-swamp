<div id="project-profile">

	<div class="control-group">
		<label class="form-label">Full name</label>
		<span><%= full_name %></span>
	</div>
	
	<div class="control-group">
		<label class="form-label">Short name</label>
		<span id="short-name"><%= short_name %></span>
	</div>

	<div class="control-group" style="display:none">
		<label class="form-label">Project type</label>
		<span id="project-type"><%= model.getProjectTypeStr() %></span>
	</div>

	<div class="control-group">
		<label class="form-label">Owner</label>
		<span id="owner">
		<% if (model && model.has('owner')) { %>
			<a href="mailto:<%= model.get('owner').email %>"><%= model.get('owner').first_name %> <%= model.get('owner').last_name %></a>
		<% } %>
		</span>
	</div>

	<div class="control-group">
		<label class="form-label">Number of members</label>
		<span id="number-of-members"></span>
	</div>

	<div class="control-group">
		<label class="form-label">Creation date</label>
		<span id="creation-date">
			<% if (model.hasCreateDate()) { %>
			<%= displayDate( model.getCreateDate() ) %>
			<% } %>
		</span>
	</div>

	<% if (model.hasUpdateDate()) { %>
	<div class="control-group">
		<label class="form-label">Last modified date</label>
		<span id="update-date">
			<%= displayDate( model.getUpdateDate() ) %>
		</span>
	</div>
	<% } %>

	<div class="control-group">
		<label class="form-label">Description</label>
		<span id="description"><%= description %></span>
	</div>
</div>
