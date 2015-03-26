<% if (collection && collection.length > 0) { %>
<table>
	<thead>
		<tr class="titles">
			<% if (showNumbering) { %>
			<th class="prepend number"></th>
			<% } %>

			<th class="name first">
				Name
			</th>

			<th class="description">
				Description
			</th>

			<th class="type">
				Type
			</th>
			
			<th class="create-date last">
				Date Added
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
<p>No packages have been uploaded yet.</p>
<% } %>