<% if (collection && collection.length > 0) { %>
<table>
	<thead>
		<tr>
			<th width="50%" class="file-extension first">
				File Extension
			</th>
			<th width="50%" class="count last">
				Number of Files
			</th>
		</tr>
	</thead>
	<tbody>
	</tbody>
</table>
<% } else { %>
<p>No file types exist.</p>
<% } %>