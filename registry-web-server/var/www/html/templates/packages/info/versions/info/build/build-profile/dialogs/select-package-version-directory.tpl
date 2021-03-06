<div class="modal-header">
	<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
	<h1 id="modal-header-text">
		<% if (title) { %>
		<%= title %>
		<% } else { %>
		Select Package Version Directory
		<% } %>
	</h1>
</div>
<div class="modal-body">
	<p>Please select a directory from the directory tree shown below.</p>
	<div style="width:100%; height:250px; overflow:auto">
		<div id="contents"></div>
	</div>
</div>
<div class="modal-footer">
	<label id="show-all-files" class="checkbox pull-left">
		<input type="checkbox" />
		Show all files
	</label>
	<button id="ok" class="btn btn-primary" data-dismiss="modal"><i class="fa fa-check"></i>OK</button> 
	<button id="cancel" class="btn" data-dismiss="modal"><i class="fa fa-times"></i>Cancel</button> 
</div>