<div class="well">
	<div id="package-version-profile"></div>
</div>

<div class="buttons">
	<% if (isOwned || isPublic) { %>
	<button id="run-new-assessment" class="btn btn-primary btn-large"><i class="fa fa-play"></i>Run New Assessment</button>
	<button id="download-version" class="btn btn-large"><i class="fa fa-download"></i>Download Version</button>
	<% } %>
	<% if (isOwned) { %>
	<button id="edit-version" class="btn btn-large"><i class="fa fa-pencil"></i>Edit Version</button>
	<button id="delete-version" class="btn btn-large"><i class="fa fa-trash"></i>Delete Version</button>
	<% } %>

	<% if (showNavigation) { %>
	<button id="cancel" class="btn btn-large"><i class="fa fa-times"></i>Cancel</button>
	<button id="next" class="btn btn-large"><i class="fa fa-arrow-right"></i>Next</button>
	<% } %>
</div>
