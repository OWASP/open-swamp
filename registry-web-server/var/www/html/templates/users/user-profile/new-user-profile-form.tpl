<form action="/" class="form-horizontal" autocomplete="off">
	
	<fieldset>
		<legend>Promotional info</legend>
		<div class="control-group">
			<label class="control-label">SWAMP promotional code</label>
			<div class="controls">
				<input type="text" autocomplete="off" name="promo-code" id="promo-code" maxlength="200" data-toggle="popover" data-placement="right" title="SWAMP Promotional Code" data-content="You may enter a SWAMP Promotional Code to receive accelerated access to features and the freedom to use an email address from any domain." />
			</div>
		</div>
	</fieldset>

	<fieldset>
		<legend>Personal info</legend>
		<div class="control-group">
			<label class="required control-label">First name</label>
			<div class="controls">
				<input type="text" name="first-name" id="first-name" class="required" value="<%= first_name %>" data-toggle="popover" data-placement="right" title="First name" data-content="This is the informal name that you are called by." />
			</div>
		</div>
		<div class="control-group">
			<label class="required control-label">Last name</label>
			<div class="controls">
				<input type="text" name="last-name" id="last-name" class="required" value="<%= last_name %>" data-toggle="popover" data-placement="right" title="Last name" data-content="This is your family name." />
			</div>
		</div>
	</fieldset>

	<fieldset>
		<legend>Account info</legend>
		<div class="control-group">
			<label class="required control-label">Email address</label>
			<div class="controls">
				<input type="text" name="email" id="email" class="required email" value="<%= email %>" data-toggle="popover" data-placement="right" title="Email address" data-content="A valid email address is required and will be used for your account registration and for password recovery." />
			</div>
		</div>
		<div class="control-group">
			<label class="required control-label">Confirm email address</label>
			<div class="controls">
				<input type="text" name="confirm-email" id="confirm-email" class="required confirm-email" value="<%= email %>" data-toggle="popover" data-placement="right" title="Confirm email address" data-content="Please retype your previously entered email address for verification.  You may use any address if you supply a SWAMP Promotional Code." />
			</div>
		</div>
		<div class="control-group">
			<label class="required control-label">SWAMP username</label>
			<div class="controls">
				<input type="text" name="username" id="username" class="required" value="<%= username %>" data-toggle="popover" data-placement="right" title="SWAMP username" data-content="Your username is the name that you use to sign in to the web site." />
			</div>
			
		</div>
		<div class="control-group">
			<label class="required control-label">SWAMP password</label>
			<div class="controls">
				<input type="password" autocomplete="off" class="required" name="password" id="password" maxlength="200" data-toggle="popover" data-placement="right" title="SWAMP password" data-content="Passwords must be at least 9 characters long including one uppercase letter, one lowercase letter, one number, and one symbol. Passwords at least 10 characters long must include one uppercase letter, one lowercase letter, and one number. Symbols are encouraged. Maximum length is 200 characters ( additonal characters will be truncated. )" />
				<div class="password-meter">
					<label class="password-meter-message"></label>
					<div class="password-meter-bg">
						<div class="password-meter-bar"></div>
					</div>
				</div>
			</div>
		</div>
		<div class="control-group">
			<label class="required control-label">Confirm SWAMP password</label>
			<div class="controls">
				<input type="password" autocomplete="off" name="confirm-password" id="confirm-password" maxlength="200" data-toggle="popover" data-placement="right" title="Confirm SWAMP password" data-content="Please retype your password exactly as you first entered it." />
			</div>
		</div>
	</fieldset>
	
	<div align="right">
		<h3><span class="required"></span>Fields are required</h3>
	</div>
</form>


