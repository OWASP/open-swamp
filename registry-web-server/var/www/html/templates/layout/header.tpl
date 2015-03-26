<div class="header navbar navbar-inverse navbar-fixed-top">
	<div class="navbar-inner">
		<div class="container">

			<div class="nav-collapse collapse">
				<ul class="nav nav-pills">
					<li><a id="brand" class="brand<% if (nav == 'brand') {%> active <% } %>">SWAMP</a></li>
					<li<% if (nav == 'about') {%> class="active" <% } %>><a id="about"><i class="fa fa-info"></i>About</a></li>
					<li<% if (nav == 'contact') {%> class="active" <% } %>><a id="contact"><i class="fa fa-comment"></i>Contact</a></li>
					<li<% if (nav == 'resources') {%> class="active" <% } %>><a id="resources"><i class="fa fa-institution"></i>Resources</a></li>
					<li<% if (nav == 'policies') {%> class="active" <% } %>><a id="policies"><i class="fa fa-gavel"></i>Policies</a></li>
					<li<% if (nav == 'help') {%> class="active" <% } %>><a id="help"><i class="fa fa-question"></i>Help</a></li>
				</ul>
			</div>

			<% if (user) { %>
			<div id="welcome-message">
				<div class="navbar-form pull-right">
					<button id="sign-out" class="btn btn-primary"><i class="fa fa-chevron-left"></i>Sign Out</button>
				</div>
				<div class="navbar-text pull-right">
					<ul class="nav nav-pills">
						<li<% if (nav == 'username') {%> class="active" <% } %>><a id="username"><i class="fa fa-user"></i>Welcome, <span id="username"><%= user.get('username') %></span></a></li>
					</ul>
				</div>
			</div>
			<% } else { %>
				<div class="navbar-form pull-right">
					<button id="sign-in" class="btn btn-primary"><i class="fa fa-chevron-right"></i>Sign In</button>
				</div>
			<% } %>
		</div>
	</div>
</div>
