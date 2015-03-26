<div class="control-group">
	<label class="form-label">Tool name</label>
	<span><%= name %></span>
</div>

<% if (0) { %>
<div class="control-group">
	<label class="form-label">Is build needed</label>
	<% if (model.has('is_build_needed')) { %>
	<% if (model.get('is_build_needed') == "1") { %>
	yes
	<% } else { %>
	no
	<% } %>
	<% } else { %>
	unknown
	<% } %>
	<br />
</div>
<% } %>

<div class="control-group">
	<label class="form-label">Package types supported</label>
	<span>
	<ul>
	<% for (var i = 0; i < package_type_names.length; i++) { %>
		<li><%= package_type_names[i] %></li>
	<% } %>
	</ul>
	</span>
</div>

<div class="control-group">
	<label class="form-label">Platforms supported</label>
	<span>
	<ul>
	<% for (var i = 0; i < platform_names.length; i++) { %>
		<li><%= platform_names[i] %></li>
	<% } %>
	</ul>
	</span>
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
