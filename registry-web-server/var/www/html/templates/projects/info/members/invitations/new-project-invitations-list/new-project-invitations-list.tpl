<% if (collection && collection.length > 0) { %>
<form class="invitations-form">
<table>
	<thead>
		<tr class="titles">
			<th class="name first">
				Name
			</th>

			<th class="email last">
				Email
			</th>

			<% if (showDelete) { %>
			<th class="append"></th>
			<% } %>
		</tr>
	</thead>
	<tbody>
	</tbody>
</table>
</form>
<% } else { %>
<br />
<p>No new project invitations.</p>
<% } %>
