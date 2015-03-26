<% if (collection && collection.length > 0) { %>
<table>
	<thead>
		<tr>
			<th class="title first">
				Provider
			</th>

			<th class="description">
				Description
			</th>

			<% if( admin ){ %>
				<th class="create_date">
					Create Date
				</th>
				<th class="status last">
					Status
				</th>
			<% } else { %>
				<th class="create_date last">
					Create Date
				</th>
			<% } %>

			<% if (showDelete) { %>
			<th class="append"></th>
			<% } %>
		</tr>
	</thead>
	<tbody>
	</tbody>
</table>
<% } else { %>
<p>No accounts have been linked with this SWAMP account.</p>
<% } %>
