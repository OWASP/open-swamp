<% if (collection && collection.length > 0) { %>
<table>
	<thead>
		<tr>
			<th class="prepend select"></th>

			<th class="first name">
				Name
			</th>

			<th class="description last">
				Description
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
<p>No schedules have been defined.</p>
<% } %>