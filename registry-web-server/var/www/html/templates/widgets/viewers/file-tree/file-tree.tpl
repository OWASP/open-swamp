
<% function showFile(file) { %>
<li class="file"><i class="fa fa-file"></i><%= file.get('name') %></li>
<% } %>

<% function showDirectory(directory, visible) { %>
	<li class="directory">
		<input type="checkbox" <% if (visible) { %> checked <% } %> />
		<i class="fa fa-folder-open"></i>
		<strong><%= directory.get('name') %></strong>
		<ul>
		<% var collection = directory.get('collection'); %>
		<% for (var i = 0; i < collection.length; i++) { %>
			<% var item = collection.at(i); %>
			<% if (item.has('collection')) { %>
				<% showDirectory(item, false); %>
			<% } else { %>
				<% showFile(item); %>
			<% } %>
		<% } %>
		</ul>
	</li>

<% } %>

<ul class="treeview">
<% showDirectory(model, true); %>
</ul>