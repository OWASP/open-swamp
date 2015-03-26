<% if (collection && collection.length > 0) { %>
<p>The following SWAMP users have previously been invited to be administrators:</p>
<table>
	<thead>
		<tr>
			<th class="name first">
				Name
			</th>

			<th class="inviter">
				Invited By
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
<p>No users have been previously invited to be administrators.</p>
<% } %>