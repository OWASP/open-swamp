<% if (collection && collection.length > 0) { %>
<table>
	<thead>
		<tr>
			<th class="name first">
				Name
			</th>

			<th class="email">
				Email
			</th>

			<th class="affiliation">
				Affiliation
			</th>

			<th class="join-date">
				Join Date
			</th>

			<th class="admin last">
				Admin
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
<p>This project has no members.</p>
<% } %>
