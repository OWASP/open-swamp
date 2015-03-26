<select class="selectpicker">
	<% for (var i = 0; i < items.length; i++) { %>
	<option<% if (items[i].name == selected) { %> selected<% } %>><%= items[i].name %></option>
	<% } %>
</select>