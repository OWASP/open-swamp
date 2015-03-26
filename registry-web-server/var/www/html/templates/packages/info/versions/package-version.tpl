<h1><div><i class="fa fa-gift"></i></div><span class="name"><%= name %></span> Package Version <span class="name"><%= version_string %></span></h1>

<ol class="breadcrumb">
	<li><a href="#home"><i class="fa fa-home"></i>Home</a></li>
	<% if (package.isOwned()) { %>
	<li><a href="#packages"><i class="fa fa-gift"></i>Packages</a></li>
	<% } else { %>
	<li><a href="#resources"><i class="fa fa-institution"></i>Resources</a></li>
	<li><a href="#packages/public"><i class="fa fa-gift"></i>Packages</a></li>
	<% } %>
	<li><a href="#packages/<%= package.get('package_uuid') %>"><i class="fa fa-gift"></i><%= name %></a></li>
	<li><i class="fa fa-gift"></i>Package Version <%= version_string %></li>
</ol>

<ul class="well nav nav-pills">
	<li><a id="assessments"><i class="fa fa-check"></i>Assessments</a></li>
	<li><a id="results"><i class="fa fa-bug"></i>Results</a></li>
	<li><a id="runs"><i class="fa fa-bus"></i>Runs</a></li>
</ul>

<ul class="nav nav-tabs">
	<li id="details"<% if (nav == 'details') { %> class="active" <% } %>>
		<a><i class="fa fa-search"></i>Details</a>
	</li>

	<li id="source"<% if (nav == 'source') { %> class="active" <% } %>>
		<a><i class="fa fa-code"></i>Source</a>
	</li>

	<li id="build"<% if (nav == 'build') { %> class="active" <% } %>>
		<a><i class="fa fa-tasks"></i>Build</a>
	</li>

	<% if (showSharing) { %>
	<li id="sharing"<% if (nav == 'sharing') { %> class="active" <% } %>>
		<a><i class="fa fa-share-alt"></i>Sharing</a>
	</li>
	<% } %>
</ul>

<div id="package-version-info"></div>
