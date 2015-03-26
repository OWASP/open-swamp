<div class="<% if (selected) { %>selected <% } %><% if (buildFile) { %>build <% } %>file" <% if (selectable) { %>style="cursor:pointer"<% } %>>
	<% if (buildFile) { %>
	<i class="fa fa-tasks"></i>
	<% } else { %>
	<i class="fa fa-file"></i>
	<% } %>
	<span class="name"><%= name %></span><% if (buildFile) { %> (build file)<% } %>
	<% if (typeof(size) != "undefined") { %>
	<span class="size"><%= size %> bytes</span>
	<% } %>
</div>