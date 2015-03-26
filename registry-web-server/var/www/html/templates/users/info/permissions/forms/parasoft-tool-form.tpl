<div id="parasoft-tool-form">
	<fieldset>
		<legend>Parasoft Agreement</legend>
		<br />
		<label class="required">User Type</label>
		
		<div class="control-group">
			<div class="controls"> 
				Open Source <input type="radio" style="min-width:30px; width:30px; margin: 0;" name="user_type" value="open_source" checked />
			</div>
			<div class="controls">
				Educational <input type="radio" style="min-width:30px; width:30px; margin: 0;" name="user_type" value="educational" />
			</div>
			<div class="controls">
				Government <input type="radio" style="min-width:30px; width:30px; margin: 0;" name="user_type" value="governmental" />
			</div>
			<div class="controls">
				Commercial <input type="radio" style="min-width:30px; width:30px; margin: 0;" name="user_type" value="commercial" /> 
			</div>
			<br />
			<div style="verical-align: top;">
				<p>
					I understand that if I am a Commercial user, Government user or I cannot be sufficiently 
					vetted as an Education User or Open Source Developer, my name and contact information 
					will be shared with Parasoft for approval purposes only.
				</p>
				<br />
				I accept <input type="checkbox" style="min-width:30px; width:30px; margin: 0;" name="type_confirm" />
			</div>
		</div>

		<label>User Information</label>
		<br />

		<div class="control-group">
			<label class="required control-label">Name</label>
			<div class="controls">
				<input type="text" name="name" id="name" maxlength="100" class="required" data-toggle="popover" data-placement="top" title="Name" data-content="Your full name for Parasoft usage." value="" />
			</div>
		</div>

		<div class="control-group">
			<label class="required control-label">Email</label>
			<div class="controls">
				<input type="text" name="email" id="email" maxlength="100" class="required" data-toggle="popover" data-placement="top" title="Email" data-content="The email address you would like to use with Parasoft." value="" />
			</div>
		</div>

		<div class="control-group">
			<label class="required control-label">Organization</label>
			<div class="controls">
				<input type="text" name="organization" id="organization" maxlength="100" class="required" data-toggle="popover" data-placement="top" title="Organization" data-content="The organization your belong to.  Please write 'Indepenent' or 'Open Source' if you do not belong to an organization." value="" />
			</div>
		</div>

		<div class="control-group">
			<label class="required control-label">Project URL</label>
			<div class="controls">
				<input type="text" name="project_url" id="project-url" maxlength="100" class="required" data-toggle="popover" data-placement="top" title="Project URL" data-content="A URL to an informational site containing information about you and / or the code you wish to access with Parasoft." value="" />
			</div>
		</div>

	</fieldset>
<div id="parasoft-tool-form">
