<form action="/" class="form-horizontal" onsubmit="return false;">
	<fieldset>
		<legend>Package Dependencies</legend>

		<div class="control-group">
			<label class="control-label">Platform Version</label>
			<div class="controls">
				<select id="platform-version" name="platform-version" data-toggle="popover" data-placement="left" title="Platform Version" data-content="If your package requires system packages to build, please select a platform version you intend to run assessments on and provide a list of dependencies.  Dependencies may differ between platform versions." >
					<option value="none"></option>
					<% platformVersions.each(function( pv ){ %>
						<option value="<%= pv.get('platform_version_uuid') %>"><%= pv.get('full_name') %></option>
					<% }); %>
				</select>
			</div>
		</div>

		<div class="control-group">
			<label class="control-label">Dependencies</label>
			<div class="controls">
				<input maxlength="8000" id="dependencies" <%= readonly ? 'readonly' : '' %> name="dependencies" value="<%= packageVersionDependencies.at(0) ? packageVersionDependencies.at(0).get('dependency_list') : '' %>"data-toggle="popover" data-placement="left" title="Dependencies" data-content="Enter a whitespace separated list of packages required for the selected platform version.  These packages will be supplied to and installed with the package manager for the associated platform before your build script is run. " />
			</div>
		</div>
	</fieldset>
</form>
