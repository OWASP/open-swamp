<div id="package-version-source-profile"></div>

<div class="buttons">
	<% if (package.isOwned()) { %>
	<button id="edit" class="btn btn-primary btn-large"><i class="fa fa-pencil"></i>Edit Source Info</button>
	<% } %>
	<button id="show-file-types" class="btn btn-large"><i class="fa fa-file"></i>Show File Types</button>
	<% if (showNavigation) { %>
	<button id="cancel" class="btn btn-large"><i class="fa fa-times"></i>Cancel</button>
	<button id="prev" class="btn btn-large"><i class="fa fa-arrow-left"></i>Prev</button>
	<button id="next" class="btn btn-large"><i class="fa fa-arrow-right"></i>Next</button>
	<% } %>
</div>
