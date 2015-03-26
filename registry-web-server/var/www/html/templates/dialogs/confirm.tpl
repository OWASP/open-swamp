<div class="modal-header">
	<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
	<h1 id="modal-header-text">
		<% if (title) { %>
		<%= title %>
		<% } else { %>
		Confirm
		<% } %>
	</h1>
</div>

<div class="modal-body">
	<i class="alert-icon fa fa-3x fa-question-circle" style="float:left; margin-left:10px; margin-right:20px"></i>
	<p><%= message %></p>
</div>

<div class="modal-footer">
	<button id="ok" class="btn btn-primary" data-dismiss="modal"><i class="fa fa-check"></i>
		<% if (ok) { %><%= ok %><% } else { %>OK<% } %>
	</button>
	<button id="cancel" class="btn" data-dismiss="modal"><i class="fa fa-times"></i>
		<% if (cancel) { %><%= cancel %><% } else { %>Cancel<% } %>
	</button> 
</div>