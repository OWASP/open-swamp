<select class="selectpicker">
	<% for (var i = 0; i < items.length; i++) { %>
	<% if (!items[i].group) { %>
	<option<% if (selected && items[i].name == selected.name) { %> selected<% } %>><%= items[i].name %></option>
	<% } else { %>
	<% var group = items[i].group; %>
	<optgroup label="<%= items[i].name %>">
		<% for (var j = 0; j < group.length; j++) { %>
		<option<% if (selected && group.at(j).get('name') == selected.get('name')) { %> selected<% } %>><%= group.at(j).get('name') %></option>
		<% } %>
	</optgroup>
	<% } %>
	<% } %>
</select>
