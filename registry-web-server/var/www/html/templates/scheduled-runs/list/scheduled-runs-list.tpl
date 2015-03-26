<% if (collection && collection.length > 0) { %>
<table>
	<thead>
		<tr>
			<% if (showNumbering) { %>
			<th class="prepend number"></th>
			<% } %>
			
			<th class="package first">
				Package
			</th>

			<th class="tool">
				Tool
			</th>

			<th class="platform">
				Platform
			</th>

			<th class="schedule last">
				Schedule
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
<p>No scheduled runs have been defined.</p>
<% } %>
