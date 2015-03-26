<% if (collection && collection.length > 0) { %>
	<table>
		<thead>
			<tr class="titles">
				<th class="name first">
					Name
				</th>

				<th class="package-types">
					Package Types
				</th>

				<th class="description">
					Description
				</th>
				
				<th class="create-date last">
					Date Added
				</th>
			</tr>
		</thead>
		<tbody>
		</tbody>
	</table>
<% } else { %>
	<p>No tools have been uploaded yet.</p>
<% } %>