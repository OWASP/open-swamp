<div class="event">
	<h2 class="title"><i class="fa fa-user"></i><i class="fa fa-folder-open"></i>User Joined Project <span class="project-short-name"></span></h2>

	<h3 class="date">
		<%= date ? displayDate( date ) : "?" %>
	</h3>
	
	<p class="description"><% if (user) { %><a class="user-name" href="mailto:<%= user.get('email') %>"><%= user.getFullName() %></a><% } else { %>User<% } %> joined project <a href="<%= projectUrl %>"><span class="project-full-name"></span></a>.</p>
</div>
