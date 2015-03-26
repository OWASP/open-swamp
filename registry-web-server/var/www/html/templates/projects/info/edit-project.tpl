<h1><div><i class="fa fa-pencil"></i></div>Edit Project <span class="name"><%= short_name %></span></h1>

<ol class="breadcrumb">
	<li><a href="#home"><i class="fa fa-home"></i>Home</a></li>
	<li><a href="#projects"><i class="fa fa-folder-open"></i>Projects</a></li>
	<li><a href="#projects/<%= model.get('project_uid') %>"><i class="fa fa-folder-open"></i>Project <%= model.get('short_name') %></a></li>
	<li>Edit Project</li>
</ol>

<div id="project-profile-form"></div>

<div class="buttons">
	<button id="save" class="btn btn-primary btn-large"><i class="fa fa-plus"></i>Save Project</button>
	<button id="cancel" class="btn btn-large"><i class="fa fa-times"></i>Cancel</button>
</div>
