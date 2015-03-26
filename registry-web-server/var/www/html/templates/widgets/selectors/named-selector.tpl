<select class="selectpicker">
	<% for (var i = 0; i < items.length; i++) { %>
	<option<% if (items[i].value) { %> value="<%= items[i].value %>"<% } %><% if (selected && (items[i].name == selected.get('name') || items[i].value == selected.get('value'))) { %> selected<% } %>>
		<%= items[i].name %>
	</option>
	<% } %>
</select>