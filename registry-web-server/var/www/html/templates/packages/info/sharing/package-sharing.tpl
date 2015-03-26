<h1><span class="name"><%= name %></span> Package Sharing Defaults</h1>

<% if (isAdmin) { %>
	<label class="radio">
		<input type="radio" name="sharing" value="private" 
		<% if (package_sharing_status.toLowerCase() == "private") { %>checked<% } %> />
		Private
		<p class="description">This package is private and can only be seen by the package owner.</p>
	</label>
	<label class="radio">
		<input type="radio" name="sharing" value="public"
		<% if (package_sharing_status.toLowerCase() == "public") { %>checked<% } %> />
		Public
		<p class="description">This package is public and may be seen by any SWAMP user.</p>
	</label>
	<label class="radio">
		<input type="radio" name="sharing" value="protected"
		<% if (package_sharing_status.toLowerCase() == "protected") { %>checked<% } %> />
		Protected
		<p class="description">This package is shared with members of the following projects:</p>
	</label>
<% } else { %>
	<p class="description">This package is shared with members of the following projects:</p>
<% } %>

<div id="select-projects-list">
	<div align="center"><i class="fa fa-spinner fa-spin fa-2x"></i><br/>Loading projects...</div>
</div>

<div class="buttons">
	<button id="save" class="btn btn-primary btn-large"><i class="fa fa-save"></i>Save</button>
	<button id="apply-to-all" class="btn btn-large"><i class="fa fa-plus"></i>Apply To All</button>
	<button id="cancel" class="btn btn-large"><i class="fa fa-times"></i>Cancel</button>
</div>
