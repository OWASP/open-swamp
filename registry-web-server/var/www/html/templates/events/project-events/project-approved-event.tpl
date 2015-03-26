<div class="event">
	<h2 class="title"><i class="fa fa-folder-open"></i>Project <%= project_short_name %> Approved</h2>

	<h3 class="date">
		<%= date ? displayDate( date ) : "?" %>
	</h3>
	
	<p class="description">Project <a href="<%= url %>"><%= project_full_name %></a> was approved by a SWAMP administrator.</p>
</div>
