<select class="selectpicker">
	<% if (defaultOptions) { %>
	<% for (var i = 0; i < defaultOptions.length; i++) { %>
	<option<% if (defaultOptions[i] == selected) { %> selected<% } %>><%= defaultOptions[i] %></option>
	<% } %>
	<% } %>
	<% for (var i = 0; i < items.length; i++) { %>
	<option<% if (items[i].version_string == selected) { %> selected<% } %>><%= items[i].version_string %></option>
	<% } %>
</select>