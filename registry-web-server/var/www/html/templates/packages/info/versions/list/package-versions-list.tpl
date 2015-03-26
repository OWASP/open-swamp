<% if (collection && collection.length > 0) { %>
<table>
	<thead>
		<tr>
			<th class="version-string first">
				Version
			</th>

			<th class="notes">
				Notes
			</th>

			<th class="date last">
				Date
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
<p>No package versions have been defined.</p>
<% } %>