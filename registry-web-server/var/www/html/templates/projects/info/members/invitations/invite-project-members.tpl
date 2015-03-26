<h1><div><i class="fa fa-envelope"></i></div><span class="name"><%= short_name %></span> Project Invitations</h1>

<ol class="breadcrumb">
	<li><a href="#home"><i class="fa fa-home"></i>Home</a></li>
	<li><a href="#projects"><i class="fa fa-folder-open"></i>Projects</a></li>
	<li><a href="#projects/<%= model.get('project_uid') %>"><i class="fa fa-folder-open"></i>Project <%= model.get('short_name') %></a></li>
	<li>Project Invitations</li>
</ol>

<div id="project-invitations-list">
	<div align="center"><i class="fa fa-spinner fa-spin fa-2x"></i><br/>Loading project invitations...</div>
</div>
<br />
<div id="new-project-invitations-list"></div>

<div class="buttons">
	<button id="add" class="btn btn-primary btn-large"><i class="fa fa-plus"></i>Add Invitation</button>
	<button id="send" class="btn btn-large"><i class="fa fa-envelope"></i>Send</button>
	<button id="cancel" class="btn btn-large"><i class="fa fa-times"></i>Cancel</button>
</div>