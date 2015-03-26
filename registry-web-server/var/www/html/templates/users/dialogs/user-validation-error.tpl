<div class="modal-header">
	<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
	<h1 id="modal-header-text">User Validation Error</h1>
</div>
<div class="modal-body">
	<p>This user profile is not valid for the following reasons: </p>
	<ul>
	<% for (var i = 0; i < errors.length; i++) { %>
		<li><%= errors[i].replace('"', "&quot") %></li>
	<% } %>
	</ul>
	<p>Please correct the form and resubmit. </p>
</div>
<div class="modal-footer">
	<button id="ok" class="btn btn-primary" data-dismiss="modal"><i class="fa fa-check"></i>OK</button> 
</div>