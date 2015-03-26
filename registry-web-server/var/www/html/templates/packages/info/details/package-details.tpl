<div class="well">
	<div id="package-profile"></div>
</div>

<h2>Versions</h2>
<% if (isOwned) { %>
<div class="btn-option">
	<button id="add-new-version" class="btn"><i class="fa fa-plus"></i>Add New Version</button>
</div>
<% } %>
<p>The following versions of this software package are available:</p>
<div style="clear:both"></div>

<div id="package-versions-list">
	<div align="center"><i class="fa fa-spinner fa-spin fa-2x"></i><br/>Loading package versions...</div>
</div>

<div class="buttons">
	<% if (isOwned || isPublic) { %>
	<button id="run-new-assessment" class="btn btn-primary btn-large"><i class="fa fa-play"></i>Run New Assessment</button>
	<% } %>
	<% if (isOwned) { %>
	<button id="edit-package" class="btn btn-large"><i class="fa fa-pencil"></i>Edit Package</button>
	<button id="delete-package" class="btn btn-large"><i class="fa fa-trash"></i>Delete Package</button>
	<% } %>
</div>
