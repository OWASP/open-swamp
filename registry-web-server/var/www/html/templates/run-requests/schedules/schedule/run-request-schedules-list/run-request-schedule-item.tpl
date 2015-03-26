<td class="type first">
	<%= recurrence_type.toTitleCase() %>
</td>
<td class="day">
	<% if (recurrence_type == "weekly") { %>
		<% if (recurrence_day == 1) { %>Sunday<% } %>
		<% if (recurrence_day == 2) { %>Monday<% } %>
		<% if (recurrence_day == 3) { %>Tuesday<% } %>
		<% if (recurrence_day == 4) { %>Wednesday<% } %>
		<% if (recurrence_day == 5) { %>Thursday<% } %>
		<% if (recurrence_day == 6) { %>Friday<% } %>
		<% if (recurrence_day == 7) { %>Saturday<% } %>
	<% } else if (recurrence_type == "monthly") { %>
		<%= recurrence_day %>
	<% } %>
</td>
<td class="time last" style="text-align:center; width:33%">
	<% if (recurrence_type != "once") { %>
	<%= UTCToLocalTimeOfDayMeridian(time_of_day) %>
	<% } %>
</td>
