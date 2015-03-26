<h1>
	<div><i class="fa fa-user"></i></div><span class="name"><%= model.getFullName() %></span>'s Account
</h1>

<ol class="breadcrumb">
	<li><a href="#home"><i class="fa fa-home"></i>Home</a></li>
	<li><a href="#overview"><i class="fa fa-eye"></i>System Overview</a></li>
	<li><a href="#accounts/review"><i class="fa fa-user"></i>Review Accounts</a></li>
	<li><i class="fa fa-user"></i><%= model.getFullName() %>'s Account</li>
</ol>

<ul class="nav nav-tabs">
	<li id="profile" class="active">
		<a>User Profile</a>
	</li>
	<li id="password">
		<a>Change Password</a>
	</li>
	<li id="permissions">
		<a>Permissions</a>
	</li>
	<li id="accounts">
		<a>Linked Accounts</a>
	</li>
</ul>

<div id="user-profile"></div>

