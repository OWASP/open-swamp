<% if (collection && collection.length > 0) { %>
<table>
	<thead>
		<tr>
			<th class="title first">
				Permission
			</th>
			<th class="description">
				Description
			</th>
			<th class="expiration">
				Expiration Date
			</th>
			<th class="status last">
				Status
			</th>
			<th style="display: none;" class="request">
			</th>
		</tr>
	</thead>
	<tbody>
	</tbody>
</table>
<% } else { %>
<p>No permissions have been defined.</p>
<% } %>
