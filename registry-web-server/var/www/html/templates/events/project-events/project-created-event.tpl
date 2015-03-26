<div class="event">
	<h2 class="title"><i class="fa fa-folder"></i>Project <%= project_short_name %> Created</h2>

	<h3 class="date">
		<%= date ? displayDate( date ) : "?" %>
	</h3>
	
	<p class="description">Project <a href="<%= url %>"><%= project_full_name %></a> was created.</p>
</div>
