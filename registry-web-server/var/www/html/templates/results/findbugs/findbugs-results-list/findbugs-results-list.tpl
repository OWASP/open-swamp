<% if (collection && collection.length > 0) { %>
<table>
	<thead>
		<tr>
			<th class="index first">
				#
			</th>
			<th class="type">
				Type
			</th>
			<th class="category">
				Category
			</th>
			<th class="priority last">
				Priority
			</th>
		</tr>
	</thead>
	<tbody>
	</tbody>
</table>
<% } else { %>
<p>No findbugs results exist.</p>
<% } %>