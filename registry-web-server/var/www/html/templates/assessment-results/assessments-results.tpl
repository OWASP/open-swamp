<h1>
	<div><i class="fa fa-bug"></i></div>
	<% if (project) { %>
	<% if (project.isTrialProject()) { %>
	My Assessment Results
	<% } else { %>
	Project <span class="name"><%= project.get('short_name') %></span> Assessment Results
	<% } %>
	<% } else { %>
	Assessment Results
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

	<% if (project) { %>
	<% if (project.isTrialProject()) { %>
	<li><i class="fa fa-bug"></i>Assessment Results</li>
	<% } else { %>
	<li><i class="fa fa-bug"></i><%= project.get('short_name') %> Assessment Results</li>
	<% } %>
	<% } else { %>
	<li><i class="fa fa-bug"></i>Assessment Results</li>
	<% } %>
</ol>

<% if (showNavigation) { %>
<ul class="well nav nav-pills">
	<li><a id="assessments"><i class="fa fa-check"></i>Assessments</a></li>
	<li><a id="runs"><i class="fa fa-bus"></i>Runs</a></li>
</ul>
<% } %>

<p>Assessment results contain the results of an assessment run of a package using a tool on a particular platform. You may view the results of a single assessment run or you may view the output of several runs of a package using different tools in order to compare the results. </p>

<div id="assessment-runs-filters"></div>

<h2><i class="fa fa-eye"></i>Viewers</h2>
<p>To view assessment results, select one or more assessment runs from the list below and then select one of the viewers below:</p>
<div style="width: 100%; text-align: center" class="btn-group btn-option">
	<% if ( typeof(viewers) != 'undefined' ) { %>
	<% for (var i = 0; i < viewers.length; i++) { %>
		<button index="<%= i %>" class="view btn"><%= viewers.at(i).get('name') %></button>
	<% } %>
	<% } %>
</div>
<div style="clear:both"></div>

<div id="assessment-runs-list">
	<div align="center"><i class="fa fa-spinner fa-spin fa-2x"></i><br/>Loading assessment runs...</div>
</div>

<br />
<label class="checkbox">
	Show numbering
	<input type="checkbox" id="show-numbering" <% if (showNumbering) { %>checked<% } %> />
</label>
