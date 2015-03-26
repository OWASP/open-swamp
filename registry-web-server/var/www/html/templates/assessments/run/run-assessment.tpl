<h1>
	<div><i class="fa fa-play"></i></div>
	<% if (project.isTrialProject()) { %>
	Run New Assessment
	<% } else { %>
	Run New <span class="name"><%= project.get('short_name') %></span> Assessment
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

	<% if (project.isTrialProject()) { %>
	<li><a href="#assessments"><i class="fa fa-check"></i>Assessments</a></li>
	<% } else { %>
	<li><a href="#assessments?project=<%= project.get('project_uid') %>"><i class="fa fa-check"></i><%= project.get('short_name') %> Assessments</a></li>
	<% } %>

	<% if (project.isTrialProject()) { %>
	<li><i class="fa fa-plus"></i>Run New Assessment</li>
	<% } else { %>
	<li><i class="fa fa-plus"></i>Run New <span class="name"><%= project.get('short_name') %></span> Assessment</li>
	<% } %>
</ol>

<p>To create a new assessment, please specify the following information:</p>

<div id="package-selection"<% if (packageVersion) { %> style="display:none"<% } %>>
	<h2><i class="fa fa-gift"></i>Package</h2>
	<div class="row-fluid">
		<div class="package span6"<% if (package) { %> style="display:none"<% } %>>
			<p>Select a <a href="#packages">package</a> to assess:</p>
			<div id="package-selector"></div>
		</div>
		<div class="version span6"<% if (package) { %> style="margin-left:0"<% } %>>
			<p>Select a version:</p>
			<div id="package-version-selector"></div>
		</div>
	</div>
</div>

<div id="tool-selection"<% if (toolVersion) { %> style="display:none"<% } %>>
	<h2><i class="fa fa-wrench"></i>Tool</h2>
	<div class="row-fluid">
		<div class="tool span6"<% if (tool) { %> style="display:none"<% } %>>
			<p>Select a <a href="#tools/public">tool</a> to perform the assessment:</p>
			<div id="tool-selector"></div>
		</div>
		<div class="version span6"<% if (tool) { %> style="margin-left:0"<% } %>>
			<p>Select a version:</p>
			<div id="tool-version-selector"></div>
		</div>
	</div>
</div>

<div id="platform-selection"<% if (platformVersion) { %> style="display:none"<% } %>>
	<h2><i class="fa fa-bars"></i>Platform</h2>
	<div class="row-fluid">
		<div class="platform span6"<% if (platform) { %> style="display:none"<% } %>>
			<p>Select a <a href="#platforms/public">platform</a> to use:</p>
			<div id="platform-selector"></div>
		</div>
		<div class="version span6"<% if (platform) { %> style="margin-left:0"<% } %>>
			<p>Select a version:</p>
			<div id="platform-version-selector"></div>
		</div>
	</div>
</div>

<br />
<div class="buttons">
	<button id="save-and-run" class="btn btn-primary btn-large" disabled><i class="fa fa-play"></i>Save and Run</button>
	<button id="save" class="btn btn-large" disabled><i class="fa fa-save"></i>Save</button>
	<button id="cancel" class="btn btn-large"><i class="fa fa-times"></i>Cancel</button>
</div>
