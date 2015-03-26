<h1>
	<div><i class="fa fa-bus"></i></div>
	<% if (project.isTrialProject()) { %>
	Assessment Run
	<% } else { %>
	<span class="name"><%= project.get('short_name') %></span> Assessment Run
	<% } %>
</h1>

<ol class="breadcrumb">
	<li><a href="#home"><i class="fa fa-home"></i>Home</a></li>

	<% if (project) { %>
	<% if (project.isTrialProject()) { %>
	<li><a href="#results<%= queryString? '?' + queryString : ''%>"><i class="fa fa-bug"></i>Assessment Results</a></li>
	<% } else { %>
	<li><a href="#results<%= queryString? '?' + queryString : ''%>"><i class="fa fa-bug"></i><%= project.get('short_name') %> Assessment Results</a></li>
	<% } %>
	<% } else { %>
	<li><a href="#results<%= queryString? '?' + queryString : ''%>"><i class="fa fa-bug"></i>All Assessment Results</a></li>
	<% } %>

	<li><i class="fa fa-bus"></i>Assessment Run</li>
</ol>

<p>The following information is available for this assessment run.</p>
<div class="well">
	<div id="assessment-run-profile"></div>
</div>

<div class="buttons">
	<button id="ok" class="btn btn-primary btn-large"><i class="fa fa-check"></i>OK</button>
</div>
