<% if (isAdmin) { %>
<label class="radio">
	<input type="radio" name="sharing" value="public"
	<% if (version_sharing_status.toLowerCase() == "public") { %>checked<% } %> />
	Public
	<p class="description">This package version is public and may be seen by any SWAMP user.</p>
</label>
<label class="radio">
	<input type="radio" name="sharing" value="protected"
	<% if ((version_sharing_status.toLowerCase() == "private") || (version_sharing_status.toLowerCase() == "protected")) { %>checked<% } %> />
	Protected
	<p class="description">This package version is shared with members of the following projects:</p>
</label>
<% } else { %>
	<p class="description">This package version is shared with members of the following projects:</p>
<% } %>

<div id="select-projects-list">
	<div align="center"><i class="fa fa-spinner fa-spin fa-2x"></i><br/>Loading projects...</div>
</div>

<div class="buttons">
	<button id="save" class="btn btn-primary btn-large"><i class="fa fa-plus"></i>Save New Package Version</button>
	<button id="prev" class="btn btn-large"><i class="fa fa-arrow-left"></i>Prev</button>
	<button id="cancel" class="btn btn-large"><i class="fa fa-arrow-left"></i>Cancel</button>
</div>
