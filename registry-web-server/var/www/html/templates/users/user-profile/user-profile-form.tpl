<form action="/" class="form-horizontal">
	<fieldset>
		<legend>Personal info</legend>

		<div class="control-group">
			<label class="required control-label">First name</label>
			<div class="controls">
				<input type="text" name="first-name" id="first-name" class="required" value="<%= first_name %>" data-toggle="popover" data-placement="right" title="First name" data-content="This is the informal name that you are called by.." />
			</div>
		</div>

		<div class="control-group">
			<label class="required control-label">Last name</label>
			<div class="controls">
				<input type="text" name="last-name" id="last-name" class="required" value="<%= last_name %>" data-toggle="popover" data-placement="right" title="Last name" data-content="This is your family name." />
			</div>
		</div>

		<div class="control-group">
			<label class="control-label">Affiliation</label>
			<div class="controls">
				<input type="text" name="affiliation" id="affiliation" value="<%= affiliation %>" data-placement="right" title="Affiliation" data-content="The company, university, or other organization that you are affiliated with." />
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
				<input type="text" name="confirm-email" id="confirm-email" class="required confirm-email" value="<%= email %>" data-toggle="popover" data-placement="right" title="Confirm email address" data-content="Please retype your previously entered email address for verification." />
			</div>
		</div>
	</fieldset>
	
	<fieldset>
		<legend>Address</legend>

		<div class="control-group">
			<label class="control-label">Street Address 1</label>
			<div class="controls">
				<input type="text" name="street-address1" id="street-address1" value="<%= model.get('address').get('street-address1') %>" data-toggle="popover" data-placement="right" title="Street address 1" data-content="The street address where you reside." />
			</div>
		</div>

		<div class="control-group">
			<label class="control-label">Street Address 2</label>
			<div class="controls">
				<input type="text" name="street-address2" id="street-address2" value="<%= model.get('address').get('street-address2') %>" data-toggle="popover" data-placement="right" title="Street address 2" data-content="Additional information about your street address (building #, apartment #, etc.)" />
			</div>
		</div>

		<div class="control-group">
			<label class="control-label">City</label>
			<div class="controls">
				<input type="text" name="city" id="city" value="<%= model.get('address').get('city') %>" data-toggle="popover" data-placement="right" title="City" data-content="The city or village where you reside." />
			</div>
		</div>

		<div class="control-group">
			<label class="control-label">State</label>
			<div class="controls">
				<input type="text" name="state" id="state" value="<%= model.get('address').get('state') %>" data-toggle="popover" data-placement="right" title="State" data-content="The state or province where you reside." />
			</div>
		</div>

		<div class="control-group">
			<label class="control-label">Postal code</label>
			<div class="controls">
				<input type="text" size="11" maxlength="11" name="postal-code" id="postal-code" value="<%= model.get('address').get('postal-code') %>" data-toggle="popover" data-placement="right" title="Postal code" data-content="The postal or 'zip' code where you reside." />
			</div>
		</div>

		<div class="control-group">
			<label class="control-label">Country</label>
			<div class="controls">
				<div id="country-selector" data-toggle="popover" data-placement="right" title="Country" data-content="The country where you reside."></div>
			</div>
		</div>
	</fieldset>

	<fieldset>
		<legend>Phone</legend>

		<div class="control-group">
			<label class="control-label">Country code</label>
			<div class="controls">
				<input type="text" readonly tabindex="-1" size="3" maxlength="3" name="country-code" id="country-code" value="<%= model.get('phone').get('country-code') %>" data-toggle="popover" data-placement="right" title="Country code" data-content="Please include your country code." />	
			</div>
		</div>

		<div class="control-group">
			<label class="control-label">Area code</label>
			<div class="controls">
				<input type="text" size="5" maxlength="5" name="area-code" id="area-code" value="<%= model.get('phone').get('area-code') %>" data-toggle="popover" data-placement="right" title="Area code" data-content="Please include your area code." />
			</div>
		</div>
		
		<div class="control-group">
			<label class="control-label">Phone number</label>
			<div class="controls">
				<input type="text" size="11" name="phone-number" id="phone-number" value="<%= model.get('phone').get('phone-number') %>" data-toggle="popover" data-placement="right" title="Phone number" data-content="Please include your telephone number." />
			</div>
		</div>
	</fieldset>

	<div align="right">
		<h3><span class="required"></span>Fields are required</h3>
	</div>
</form>


