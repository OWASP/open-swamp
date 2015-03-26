<div class="modal-header">
	<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
	<h1 id="modal-header-text">
		<% if (title) { %>
		<%= title %>
		<% } else { %>
		Notification
		<% } %>
	</h1>
</div>

<div class="modal-body">
	<i class="alert-icon fa fa-3x fa-info-circle" style="float:left; margin-left:10px; margin-right:20px"></i>
	<p><%= message %></p>
</div>

<div class="modal-footer">
	<button id="ok" class="btn btn-primary" data-dismiss="modal"><i class="fa fa-check"></i>OK</button> 
</div>