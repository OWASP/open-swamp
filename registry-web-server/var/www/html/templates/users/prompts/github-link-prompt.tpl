<h1>Link Existing SWAMP Account to GitHub</h1>

<p>Please supply your SWAMP username and password to link your SWAMP account to the following GitHub account: <b><%= username %></b></p>

<div class="control-group">
	<label class="required control-label">SWAMP Username</label>
	<div class="controls">
		<input type="text" id="username" />
	</div>
</div>

<div class="control-group">
	<label class="required control-label">SWAMP Password</label>
	<div class="controls">
		<input type="password" id="password" name="password" autocomplete="off" maxlength="200" />
	</div>
</div>

<div class="alert alert-error" style="display:none">
	<button type="button" class="close" data-dismiss="alert"><i class="fa fa-close"></i></button>
	<label>Error: </label><span class="message">User name and password are not correct.  Please try again.</span>
</div>

<div class="buttons">
	<button id="submit" class="btn btn-large btn-primary"><i class="fa fa-plus"></i>Submit</button>
	<button id="cancel" class="btn btn-large"><i class="fa fa-times"></i>Cancel</button>
</div>
