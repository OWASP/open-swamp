<% if (collection && collection.length > 0) { %>
<table>
	<thead>
		<tr>
			<% if (showNumbering) { %>
			<th class="prepend number"></th>
			<% } %>
			
			<th class="datetime first">
				Date / Time
			</th>

			<th class="package">
				Package
			</th>

			<th class="tool">
				Tool
			</th>

			<th class="platform">
				Platform
			</th>

			<th class="status<% if (!showResults) { %> last<% } %>">
				Status
			</th>

			<% if (showResults) { %>
			<th class="results last">
				Results
			</th>
			<% } %>

			<% if (showDelete) { %>
			<th class="append"></th>
			<% } %>

			<th style="display: none">
			</th>
		</tr>
	</thead>
	<tbody>
	</tbody>
</table>
<% } else { %>
<p>No assessment runs exist.</p>
<% } %>
