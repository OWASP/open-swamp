<div class="file-list">
	<% if (collection && collection.length > 0) { %>
		<table>
			<thead>
				<tr>
					<th class="name first">
						Name
					</th>
					<th class="size last">
						Size
					</th>
				</tr>
			</thead>
			<tbody>
			</tbody>
		</table>
	<% } else { %>
		<p>No files.</p>
	<% } %>
</div>