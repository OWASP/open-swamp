<select class="selectpicker">
	<% for (var i = 0; i < items.length; i++) { %>
	<option<% if (items.length == 1 || items[i].version_string == selected) { %> selected="selected" <% } %>><%= items[i].version_string %></option>
	<% } %>
</select>
