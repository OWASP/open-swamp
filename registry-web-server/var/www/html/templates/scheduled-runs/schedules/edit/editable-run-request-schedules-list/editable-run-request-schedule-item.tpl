<td class="type first">
	<select>
		<option value="daily" <% if (recurrence_type == "daily") { %>selected<% } %>>Daily</option>
		<option value="weekly" <% if (recurrence_type == "weekly") { %>selected<% } %>>Weekly</option>
		<option value="monthly" <% if (recurrence_type == "monthly") { %>selected<% } %>>Monthly</option>
	</select>
</td>

<td class="day">
	<% if (recurrence_type == "weekly") { %>
	<select class="day-of-the-week">
		<option value="sunday" <% if (recurrence_day == 1) { %>selected<% } %>>Sunday</option>
		<option value="monday" <% if (recurrence_day == 2) { %>selected<% } %>>Monday</option>
		<option value="tuesday" <% if (recurrence_day == 3) { %>selected<% } %>>Tuesday</option>
		<option value="wednesday" <% if (recurrence_day == 4) { %>selected<% } %>>Wednesday</option>
		<option value="thursday" <% if (recurrence_day == 5) { %>selected<% } %>>Thursday</option>
		<option value="friday" <% if (recurrence_day == 6) { %>selected<% } %>>Friday</option>
		<option value="saturday" <% if (recurrence_day == 7) { %>selected<% } %>>Saturday</option>
	</select>
	<% } else if (recurrence_type == "monthly") { %>
		<input class="day-of-the-month" type="number" value="<%= recurrence_day %>" min="0" max="31" placeholder="Day of the month" />
	<% } %>
</td>

<td class="time last">
	<% if (recurrence_type != "once") { %>
	<div class="bootstrap-timepicker control-group time_shim_container">
		<div class="input-append">
			<input type="text" name="time-shim_<%= model.cid %>" class="input-small time_shim" value="<%= time_of_day_meridian %>" placeholder="Time" />
			<span class="add-on"><i class="fa fa-clock-o"></i></span>
		</div>
	</div>
	<div class="time_container control-group">
		<div class="input-append">
			<input type="time" name="time_<%= model.cid %>" class="time_input" value="<%= time_of_day %>" placeholder="Time" />
			<span class="add-on"><i class="fa fa-clock-o"></i></span>
		</div>
	</div>
	<% } %>
</td>

<% if (showDelete) { %>
<td class="append">
	<button type="button" class="delete"><i class="fa fa-times"></i></button>
</td>
<% } %>
