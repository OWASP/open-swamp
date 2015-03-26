<% if (showNumbering) { %>
<td class="prepend number">
	<%= index %>
</td>
<% } %>

<td class="datetime first">
<%= sortableDate(model.getCreateDate()) %>
</td>

<td class="package">
	<% if (packageUrl) { %>
	<a href="<%= packageUrl %>"><span class="name"><%= package.name %></span></a>
	<% } else { %>
	<span class="name"><%= package.name %></span>
	<% } %>

	<% if (packageVersionUrl) { %>
	<a href="<%= packageVersionUrl %>"><span class="version label"><%= package.version_string %></span></a>
	<% } else { %>
	<span class="version label"><%= package.version_string %></span>
	<% } %>
</td>

<td class="tool">
	<% if (toolUrl) { %>
	<a href="<%= toolUrl %>"><span class="name"><%= tool.name %></span></a>
	<% } else { %>
	<span class="name"><%= tool.name %></span>
	<% } %>

	<% if (toolVersionUrl) { %>
	<a href="<%= toolVersionUrl %>"><span class="version label"><%= tool.version_string %></span></a>
	<% } else { %>
	<span class="version label"><%= tool.version_string %></span>
	<% } %>
</td>

<td class="platform">
	<% if (platformUrl) { %>
	<a href="<%= platformUrl %>"><span class="name"><%= platform.name %></span></a>
	<% } else { %>
	<span class="name"><%= platform.name %></span>
	<% } %>

	<% if (platformVersionUrl) { %>
	<a href="<%= platformVersionUrl %>"><span class="version label"><%= platform.version_string %></span></a>
	<% } else { %>
	<span class="version label"><%= platform.version_string %></span>
	<% } %>
</td>

<td class="status<% if (!showResults) { %> last<% } %>">
	<a href="<%= runUrl %>"><%= model.get('status') %></a>
</td>

<% if (showResults) { %>
<td class="results last">
	<% if (model.hasErrors()) { %>
	<button id="errors" data-content="View errors" data-container="body"><i class="fa fa-exclamation"></i></button>
	<% } else { %>
	<% if (model.get('assessment_result_uuid')) { %>

	<% if (typeof(weakness_cnt) != 'undefined' && weakness_cnt > 0) { %>
	<i class="fa fa-bug"></i> <span class="badge"><%= weakness_cnt %></span>
	<% } else { %>
	<i class="fa fa-bug"></i> <span class="badge badge-important">0</span>
	<% } %>

	<input type="checkbox" <% if (isChecked) { %> checked <% } %> />
	<% } %>
	<% } %>
</td>
<% } %>

<% if (showDelete) { %>
<td class="append">
	<button type="button" class="delete"><i class="fa fa-times"></i></button>
</td>
<% } %>

<td style="background: white; <% if (!showSsh) { %> display: none; <% } %>" class="interactive">
	<% if (showSsh) { %>
		<button class="btn ssh" title="SSH Credentials">SSH</button>
	<% } %>
</td>

