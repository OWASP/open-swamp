<% if (collection && collection.length > 0) { %>
<table>
	<thead>
		<tr>
			<% if (showNumbering) { %>
			<th class="prepend number"></th>
			<% } %>
			
			<th class="full-name first">
				Full Name
			</th>

			<th class="owner">
				Owner
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
<p>No projects have been registered yet.</p>
<% } %>
