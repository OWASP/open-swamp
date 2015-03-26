<select class="selectpicker">
	<% for (var i = 0; i < items.length; i++) { %>
		<% var image = items[i].iso.toLowerCase(); %>
		<option data-subtext="<img src='images/flag-icons/blank.gif' class='flag flag-<%= image %>'/>">
			<%= items[i].name %>
		</option>
	<% } %>
</select>
