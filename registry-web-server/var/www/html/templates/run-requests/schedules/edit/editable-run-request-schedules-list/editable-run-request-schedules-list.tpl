<form class="run-requests-form">
<% if (collection && collection.length > 0) { %>
<table>
	<thead>
		<tr>
			<th class="package first">
				Type
			</th>

			<th class="tool">
				Day
			</th>

			<th class="platform last">
				Time
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
<p>No run requests have been defined.</p>
<% } %>
</form>
