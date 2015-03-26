<h1><div><i class="fa fa-pencil"></i></div>Edit <span class="name"><%= package.get('name') %> <%= version_string %></span> Package Version Details</h1>

<ol class="breadcrumb">
	<li><a href="#home"><i class="fa fa-home"></i>Home</a></li>
	<li><a href="#packages"><i class="fa fa-gift"></i>Packages</a></li>
	<li><a href="#packages/<%= package.get('package_uuid') %>"><i class="fa fa-gift"></i><%= package.get('name') %></a></li>
	<li><a href="#packages/versions/<%= model.get('package_version_uuid') %>"><i class="fa fa-gift"></i>Package Version <%= version_string %></a></li>
	<li><i class="fa fa-pencil"></i>Edit Details</li>
</ol>

<div id="package-version-profile-form"></div>

<div class="buttons">
	<button id="save" class="btn btn-primary btn-large"><i class="fa fa-plus"></i>Save Details</button>
	<button id="cancel" class="btn btn-large"><i class="fa fa-times"></i>Cancel</button>
</div>
