<div class="well">
	<div id="tool-profile"></div>
</div>

<h2>Versions</h2>
<% if (isOwned) { %>
<div class="btn-option">
	<button id="add-new-version" class="btn"><i class="fa fa-plus"></i>Add New Version</button>
</div>
<% } %>
<p>The following versions of this software tool are available: </p>
<div style="clear:both"></div>


<div id="tool-versions-list">
	<div align="center"><i class="fa fa-spinner fa-spin fa-2x"></i><br/>Loading tool versions...</div>
</div>

<div class="buttons">
	<button id="run-new-assessment" class="btn btn-primary btn-large"><i class="fa fa-play"></i>Run New Assessment</button>
	<% if (isOwned) { %>
	<button id="edit-tool" class="btn btn-large"><i class="fa fa-pencil"></i>Edit Tool</button>
	<button id="delete-tool" class="btn btn-large"><i class="fa fa-trash"></i>Delete Tool</button>
	<% } %>
	<% if (showPolicy) { %>
	<button id="show-policy" class="btn btn-large"><i class="fa fa-gavel"></i>Show Policy</button>
	<% } %>
</div>