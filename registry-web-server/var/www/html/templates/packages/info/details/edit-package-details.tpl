<h1><div><i class="fa fa-pencil"></i></div>Edit Package <span class="name"><%= name %></span></h1>

<ol class="breadcrumb">
	<li><a href="#home"><i class="fa fa-home"></i>Home</a></li>
	<li><a href="#packages"><i class="fa fa-gift"></i>Packages</a></li>
	<li><a href="#packages/<%= package.get('package_uuid') %>"><i class="fa fa-gift"></i><%= name %></a></li>
	<li><i class="fa fa-pencil"></i>Edit Package</li>
</ol>

<div id="package-profile-form"></div>

<div class="buttons">
	<button id="save" class="btn btn-primary btn-large"><i class="fa fa-plus"></i>Save Package</button>
	<button id="cancel" class="btn btn-large"><i class="fa fa-times"></i>Cancel</button>
</div>
