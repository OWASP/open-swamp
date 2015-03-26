<% if (collection && collection.length > 0) { %>
<table>
	<thead>
		<tr>
			<th class="name first">
				Name
			</th>

			<th class="email last">
				Email
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
<br />
<p>There are no system admins.</p>
<% } %>