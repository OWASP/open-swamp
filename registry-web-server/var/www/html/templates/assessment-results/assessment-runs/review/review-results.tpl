<h1>
	<div><i class="fa fa-bug"></i></div>
	<% if (project) { %>
	<% if (project.isTrialProject()) { %>
	Review My Assessment Results
	<% } else { %>
	Review Project <span class="name"><%= project.get('short_name') %></span> Assessment Results
	<% } %>
	<% } else { %>
	Review Assessment Results
	<% } %>

	<% if (package) { %>
	of <span class="name"><%= package.get('name') %></span>
	<% } %>

	<% if (packageVersion) { %>
	Version <span class="name"><%= typeof(packageVersion) == 'string'? packageVersion.toTitleCase() : packageVersion.get('version_string') %></span>
	<% } %>

	<% if (tool) { %>
	using <span class="name"><%= tool.get('name') %></span>
	<% } %>

	<% if (toolVersion) { %>
	Version <span class="name"><%= typeof(toolVersion) == 'string'? toolVersion.toTitleCase() : toolVersion.get('version_string') %></span>
	<% } %>

	<% if (platform) { %>
	on <span class="name"><%= platform.get('name') %></span>
	<% } %>

	<% if (platformVersion) { %>
	Version <span class="name"><%= typeof(platformVersion) == 'string'? platformVersion.toTitleCase() : platformVersion.get('version_string') %></span>
	<% } %>
</h1>

<ol class="breadcrumb">
	<li><a href="#home"><i class="fa fa-home"></i>Home</a></li>
	<li><a href="#overview"><i class="fa fa-eye"></i>System Overview</a></li>

	<% if (project) { %>
	<% if (project.isTrialProject()) { %>
	<li><i class="fa fa-bug"></i>Review Assessment Results</li>
	<% } else { %>
	<li><i class="fa fa-bug"></i>Review <%= project.get('short_name') %> Assessment Results</li>
	<% } %>
	<% } else { %>
	<li><i class="fa fa-bug"></i>Review Assessment Results</li>
	<% } %>
</ol>

<div id="assessment-runs-filters"></div>
<br />

<div id="assessment-runs-list">
	<div align="center"><i class="fa fa-spinner fa-spin fa-2x"></i><br/>Loading assessment results...</div>
</div>

<br />
<label class="checkbox">
	Show numbering
	<input type="checkbox" id="show-numbering" <% if (showNumbering) { %>checked<% } %> />
</label>
