<% if (collection && collection.length > 0) { %>
<table>
	<thead>
		<tr>
			<% if (showNumbering) { %>
			<th class="prepend number"></th>
			<% } %>
			
			<th class="prepend select">
				<input type="checkbox" class="select-all" />
			</th>

			<th class="package first">
				Package
			</th>

			<th class="tool">
				Tool
			</th>

			<th class="platform">
				Platform
			</th>

			<th class="results last">
				Results
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
<p>No assessments have been defined.</p>
<% } %>