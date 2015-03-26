<h1><div><i class="fa fa-gift"></i></div><span class="name"><%= name %></span> Package</h1>

<ol class="breadcrumb">
	<li><a href="#home"><i class="fa fa-home"></i>Home</a></li>
	<% if (model.isOwned()) { %>
	<li><a href="#packages"><i class="fa fa-gift"></i>Packages</a></li>
	<% } else { %>
	<li><a href="#resources"><i class="fa fa-institution"></i>Resources</a></li>
	<li><a href="#packages/public"><i class="fa fa-gift"></i>Packages</a></li>
	<% } %>
	<li><i class="fa fa-gift"></i><%= name %></li>
</ol>

<ul class="well nav nav-pills">
	<li><a id="assessments"><i class="fa fa-check"></i>Assessments</a></li>
	<li><a id="results"><i class="fa fa-bug"></i>Results</a></li>
	<li><a id="runs"><i class="fa fa-bus"></i>Runs</a></li>
</ul>

<div id="package-info"></div>
