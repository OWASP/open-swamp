<% if (collection && collection.length > 0) { %>
<table>
	<thead>
		<tr>
			<th class="name first">
				Name
			</th>
			<th class="email">
				Email
			</th>
			<th class="all last">
					All <input type="checkbox" style="position: relative; bottom: 3px; left: 5px;" id="select-all" />
			</th>
		</tr>
	</thead>
	<tbody>
	</tbody>
</table>
<% } else { %>
<br />
<p>There are no system email users.</p>
<% } %>
