<fieldset>
	<legend>Personal info</legend>
	<div class="control-group">
		<label class="control-label">First name</label>
		<span><%= first_name %></span>
	</div>
	<div class="control-group">
		<label class="control-label">Last name</label>
		<span><%= last_name %></span>
	</div>

	<% if (affiliation) { %>
	<div class="control-group">
		<label class="control-label">Affiliation</label>
		<span><%= affiliation %></span>
	</div>
	<% } %>
</fieldset>

<fieldset>
	<legend>Account info</legend>	
	<div class="control-group">
		<label class="control-label">Email address</label>
		<span><a href="mailto:<%= email %>"><%= email %></a></span>
	</div>
	<div class="control-group">
		<label class="control-label">SWAMP username</label>
		<span><%= username %></span>
	</div>
</fieldset>

<fieldset>
	<legend>Address</legend>

	<div class="control-group">
		<label class="control-label">Street address 1</label>
		<span>
		<% if (model.has('address') && model.get('address').hasAttributes()) { %>
		<% if (model.get('address').has('street-address1')) { %>
		<%= model.get('address').get('street-address1') %>
		<% } %>
		<% } %>
		</span>
	</div>

	<div class="control-group">
		<label class="control-label">Street address 2</label>
		<span>
		<% if (model.has('address') && model.get('address').hasAttributes()) { %>
		<% if (model.get('address').has('street-address2')) { %>
		<%= model.get('address').get('street-address2') %>
		<% } %>
		<% } %>
		</span>
	</div>
	
	<div class="control-group">
		<label class="control-label">City</label>
		<span>
		<% if (model.has('address') && model.get('address').hasAttributes()) { %>
		<% if (model.get('address').has('city')) { %>
		<%= model.get('address').get('city') %>
		<% } %>
		<% } %>
		</span>
	</div>

	<div class="control-group">
		<label class="control-label">State</label>
		<span>
		<% if (model.has('address') && model.get('address').hasAttributes()) { %>
		<% if (model.get('address').has('state')) { %>
		<%= model.get('address').get('state') %>
		<% } %>
		<% } %>
		</span>
	</div>
	
	<div class="control-group">
		<label class="control-label">Postal code</label>
		<span>
		<% if (model.has('address') && model.get('address').hasAttributes()) { %>
		<% if (model.get('address').has('postal-code')) { %>
		<%= model.get('address').get('postal-code') %>
		<% } %>
		<% } %>
		</span>
	</div>

	<div class="control-group">
		<label class="control-label">Country</label>
		<span>
		<% if (model.has('address') && model.get('address').hasAttributes()) { %>
		<% if (model.get('address').has('country')) { %>
		<%= model.get('address').get('country') %>
		<% } %>
		<% } %>
		</span>
	</div>
</fieldset>

<fieldset>
	<legend>Phone</legend>

	<div class="control-group">
		<label class="control-label">Country code</label>
		<span>
		<% if (model.has('phone') && model.get('phone').hasAttributes()) { %>
		<% if (model.get('phone').has('country-code')) { %>
		<%= model.get('phone').get('country-code') %>
		<% } %>
		<% } %>
		</span>
	</div>
	
	<div class="control-group">
		<label class="control-label">Area code</label>
		<span>
		<% if (model.has('phone') && model.get('phone').hasAttributes()) { %>
		<% if (model.get('phone').has('area-code')) { %>
		(<%= model.get('phone').get('area-code') %>)
		<% } %>
		<% } %>
		</span>
	</div>
	
	<div class="control-group">
		<label class="control-label">Phone number</label>
		<span>
		<% if (model.has('phone') && model.get('phone').hasAttributes()) { %>
		<% if (model.get('phone').has('phone-number')) { %>
		<%= model.get('phone').get('phone-number') %>
		<% } %>
		<% } %>
		</span>
	</div>
</fieldset>

<% if (model.hasCreateDate() || model.hasUpdateDate()) { %>
<fieldset>
	<legend>Dates</legend>

	<% if (model.hasCreateDate()) { %>
	<div class="control-group">
		<label class="control-label">Creation date</label>
		<span><%= displayDate(model.getCreateDate()) %></span>
	</div>
	<% } %>

	<% if (model.hasUpdateDate()) { %>
	<div class="control-group">
		<label class="control-label">Last modified date</label>
		<span><%= displayDate(model.getUpdateDate()) %></span>
	</div>
	<% } %>
</fieldset>
<% } %>

<div class="buttons">
	<button id="edit" class="btn btn-primary btn-large"><i class="fa fa-pencil"></i>Edit Profile</button>
	<button id="delete-account" class="btn btn-large"><i class="fa fa-trash"></i>Delete Account</button>
</div>

