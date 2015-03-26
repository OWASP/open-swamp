<table>
	<thead>
		<tr>
			<th class="domain-name first">
				Domain
			</th>

			<th class="description last">
				Description
			</th>

			<% if (showDelete) { %>
			<th class="append"></th>
			<% } %>
		</tr>
	</thead>
	<tbody>
	</tbody>
</table>
<% if (collection && collection.length == 0) { %>
<br />
<p>No restricted domains.</p>
<% } %>
