<div class="modal-header">
	<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
	<h1 id="modal-header-text">
		Sign In
	</h1>
</div>
<div class="modal-body">
	<div class="control-group">
		<label class="control-label">SWAMP Username</label>
		<div class="controls">
			<input type="text" id="swamp-username" />
		</div>
	</div>

	<div class="control-group">
		<label class="control-label">SWAMP Password</label>
		<div class="controls">
			<input type="password" autocomplete="off" id="swamp-password" maxlength="200" />
		</div>
	</div>

	<div align="center">
		<strong>- Or -</strong>
	</div>
	<br />
	
	<div class="control-group">
		<label class="control-label">Sign in with</label>
		<div class="controls">
			<a id="github-signin" class="btn btn-large" href="<%= github_redirect %>"><i class="fa fa-github"></i>GitHub</a>
		</div>			
	</div>

	<div class="alert alert-error" style="display:none">
		<button type="button" class="close" data-dismiss="alert"><i class="fa fa-close"></i></button>
		<label>Error: </label><span class="message">User name and password are not correct.  Please try again.</span>
	</div>

	<hr>

	<a id="reset-password" class="fineprint">Reset my password</a>
	<br />
	<a id="request-username" class="fineprint">Request my username</a>
	
</div>
<div class="modal-footer">
	<button id="cancel" class="btn" data-dismiss="modal"><i class="fa fa-times"></i>Cancel</button>
	<button id="ok" class="btn btn-primary"><i class="fa fa-check"></i>OK</button> 
</div>
