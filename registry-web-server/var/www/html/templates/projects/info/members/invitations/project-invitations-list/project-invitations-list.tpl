<% if (collection && collection.length > 0) { %>
<p>The following SWAMP users have previously been invited to project <%= full_name %>.</p>
<table>
	<thead>
		<tr class="titles">
			<th class="name first">
				Name
			</th>

			<th class="email">
				Email
			</th>

			<th class="date">
				Invitation Date
			</th>

			<th class="status last">
				Status
			</th>

			<% if (showDelete) { %>
			<th class="append"></th>
			<% } %>
		</tr>
	</thead>
	<tbody>
	</tbody>
</table>
<% } else { %>
<p>No users have been previously invited to project <%= full_name %>.</p>
<% } %>
