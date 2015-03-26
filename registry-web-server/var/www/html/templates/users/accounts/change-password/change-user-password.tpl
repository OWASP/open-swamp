<form action="/" class="form-horizontal">
	<div class="alert alert-error" style="display:none">
		<button type="button" class="close" data-dismiss="alert"><i class="fa fa-close"></i></button>
		<label>Error: </label><span class="message">Please try again.</span>
	</div>
	
	<div class="control-group">
		<label class="required control-label">New password</label>
		<div class="controls">
			<input type="password" autocomplete="off" class="required" name="password" id="new-password" maxlength="200" data-toggle="popover" data-placement="right" title="New password" data-content="Passwords must be at least 9 characters long including one uppercase letter, one lowercase letter, one number, and one symbol. Passwords at least 10 characters long must include one uppercase letter, one lowercase letter, and one number. Symbols are encouraged. Maximum length is 200 characters ( additonal characters will be truncated. )" />
			<div class="password-meter">
				<label class="password-meter-message"></label>
				<div class="password-meter-bg">
					<div class="password-meter-bar"></div>
				</div>
			</div>
		</div>
	</div>
	
	<div class="control-group">
		<label class="required control-label">Confirm new password</label>
		<div class="controls">
			<input type="password" autocomplete="off" name="confirm-password" id="confirm-password" maxlength="200" data-toggle="popover" data-placement="right" title="Confirm new password" data-content="Please retype your password exactly as you first entered it." />
		</div>
	</div>

	<div align="right">
		<h3><span class="required"></span>Fields are required</h3>
	</div>
</form> 

<div class="buttons">
	<button id="submit" class="btn btn-primary btn-large"><i class="fa fa-check"></i>Submit</button>
</div>
