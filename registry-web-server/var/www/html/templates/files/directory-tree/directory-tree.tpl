<div class="<% if (selected) { %>selected <% } %><% if (root) { %>root <% } %>directory">
	<div class="info" <% if (selectable) { %>style="cursor:pointer"<% } %> >

		<% if (checked) { %>
		<i class="fa fa-minus-circle expander"></i>
		<% } else { %>
		<i class="fa fa-plus-circle expander"></i>
		<% } %>

		<% if (checked) { %>
		<i class="fa fa-folder-open"></i>
		<% } else { %>
		<i class="fa fa-folder"></i>
		<% } %>
		
		<strong><div class="name"><%= name %></div></strong>
	</div>
	<ul class="contents">
	</ul>
</div>
