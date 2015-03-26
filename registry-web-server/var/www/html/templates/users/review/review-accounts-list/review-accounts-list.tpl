<% if (collection && collection.length > 0) { %>
<table>
	<thead>
		<tr>
			<% if (showNumbering) { %>
			<th class="prepend number"></th>
			<% } %>
			
			<th class="username first">
				Username
			</th>

			<th class="full-name">
				Full Name
			</th>

			<th class="affiliation">
				Affiliation
			</th>

			<th class="create-date">
				Create Date
			</th>
			
			<th class="status last">
				Status
			</th>
		</tr>
	</thead>
	<tbody>
	</tbody>
</table>
<% } else { %>
<p>No accounts have been registered yet.</p>
<% } %>
