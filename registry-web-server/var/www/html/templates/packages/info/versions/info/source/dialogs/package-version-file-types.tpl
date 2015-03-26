<div class="modal-header">
	<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
	<h1 id="modal-header-text">
		<% if (title) { %>
		<%= title %>
		<% } else { %>
		Package Version File Types
		<% } %>
	</h1>
</div>
<div class="modal-body">
	<p>The following is a list of the file types contained in this package version within the path '<%= packagePath %>'.</p>
	<div style="width:100%; height:250px; overflow:auto">
		<div id="file-types"></div>
	</div>
</div>
<div class="modal-footer">
	<button id="ok" class="btn btn-primary" data-dismiss="modal"><i class="fa fa-check"></i>OK</button> 
</div>