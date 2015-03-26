<% if (collection && collection.length > 0) { %>
<table>
	<thead>
		<tr>
			<% if (showNumbering) { %>
			<th class="prepend number"></th>
			<% } %>
			
			<th class="name first">
				Name
			</th>

			<th class="package-types">
				Package Types
			</th>

			<th class="sharing">
				Sharing
			</th>

			<th class="create-date last">
				Create Date
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
<p>No tools have been uploaded yet.</p>
<% } %>