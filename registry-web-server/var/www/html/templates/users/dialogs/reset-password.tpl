<div class="modal-header">
	<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
	<h1 id="modal-header-text">Reset Password</h1>
</div>
<div class="modal-body">
	<p><% if (showUser) { %>Please enter your SWAMP username or email address below. <% } %>After clicking the Request Reset button an email will be sent to your registered email address containing a link to reset your password.</p>

	<% if (showUser) { %>
	<div align="center" style="float:left">
		<label>SWAMP Username:</label>
		<input type="text" id="swamp-username" />
	</div>
	<span style="float:left; margin:25px">or</span>
	<div align="center">
		<label>Email Address:</label>
		<input type="text" id="email-address" />
	</div>
	<p></p>
	<% } %>
</div>
<div class="modal-footer">
	<button id="reset-password" class="btn btn-primary" data-dismiss="modal"><i class="fa fa-plus"></i>Request Reset</button>
	<button id="cancel" class="btn" data-dismiss="modal"><i class="fa fa-times"></i>Cancel</button> 
</div>


