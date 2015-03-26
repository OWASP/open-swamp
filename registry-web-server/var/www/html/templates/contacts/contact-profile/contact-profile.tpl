<div id="user-profile">

	<fieldset>
		<legend>Personal info</legend>
		<div class="control-group">
			<label class="form-label">First name</label>
			<span><%= first_name %></span>
		</div>
		<div class="control-group">
			<label class="form-label">Last name</label>
			<span><%= last_name %></span>
		</div>
	</fieldset>
	<fieldset>
		<legend>Contact info</legend>	
		<div class="control-group">
			<label class="form-label">Email address</label>
			<span><a href="mailto:<%= email %>"><%= email %></a></span>
		</div>
		<div class="control-group">
			<label class="form-label">Affiliation</label>
			<span><%= affiliation %></span>
		</div>
		<div class="control-group">
			<label class="form-label">Country</label>
			<span><%= country %></span>
		</div>
	</fieldset>
	<fieldset>
		<legend>Phone</legend>
		<div class="control-group">
			<label class="form-label">Country code</label>
			<span>
				<% if (model.get('phone').has('country-code')) { %>
					<%= model.get('phone').get('country-code') %>
				<% } %>
			</span>
		</div>
		<div class="control-group">
			<label class="form-label">Area code</label>
			<span>
				<% if (model.get('phone').has('area-code')) { %>
					(<%= model.get('phone').get('area-code') %>)
				<% } %>
			</span>
		</div>
		<div class="control-group">
			<label class="form-label">Phone number</label>
			<span>
				<% if (model.get('phone').has('phone-number')) { %>
					<%= model.get('phone').get('phone-number') %>
				<% } %>
			</span>
		</div>
	</fieldset>

	<div class="control-group">
		<label class="form-label">Question</label>
		<span><%= question %></span>
	</div>

 	<% if (false) { %>
	<fieldset>
		<legend>Dates</legend>
		<div class="control-group">
			<label class="form-label">Creation date</label>
			<span id="owner">
				<% if (model.hasCreateDate()) { %>
				<%= displayDate( model.getCreateDate() ) %>
				<% } %>
			</span>
		</div>
		<div class="control-group">
			<label class="form-label">Last modified</label>
			<span id="owner">
				<% if (model.hasUpdateDate()) { %>
				<%= displayDate( model.getUpdateDate() ) %>
				<% } %>
			</span>
		</label>
	</fieldset>
	<% } %>
</div>
