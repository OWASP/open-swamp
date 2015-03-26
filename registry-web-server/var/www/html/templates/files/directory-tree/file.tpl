<div class="<% if (selected) { %>selected <% } %>file" <% if (selectable) { %>style="cursor:pointer"<% } %>>
	<i class="fa fa-file"></i>
	<span class="name"><%= name %></span>
	<% if (typeof(size) != "undefined") { %>
	<span class="size"><%= size %> bytes</span>
	<% } %>
</div>