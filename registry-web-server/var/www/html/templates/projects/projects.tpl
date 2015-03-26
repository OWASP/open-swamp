<h1><div><i class="fa fa-folder-open"></i></div>Projects</h1>

<ol class="breadcrumb">
	<li><a href="#home"><i class="fa fa-home"></i>Home</a></li>
	<li><i class="fa fa-folder-open"></i>Projects</li>
</ol>

<p>Projects are used to share assessment results with other SWAMP users. You can invite other users to join a project and then all members of the project can add assessments to that project and view assessment results belonging to that project. </p>

<div class="btn-option" style="margin-bottom:0">
	<button id="add-new-project" class="btn"><i class="fa fa-plus"></i>Add New Project</button>
</div>
<br />

<div id="owned-projects">
	<h2>Projects I Own</h2>
	<div id="owned-projects-list">
		<div align="center"><i class="fa fa-spinner fa-spin fa-2x"></i><br/>Loading owned rojects...</div>
	</div>
</div>

<div id="joined-projects">
	<h2>Projects I Joined</h2>
	<div id="joined-projects-list">
		<div align="center"><i class="fa fa-spinner fa-spin fa-2x"></i><br/>Loading joined projects...</div>
	</div>
</div>

<br />
<label class="checkbox">
	Show numbering
	<input type="checkbox" id="show-numbering" <% if (showNumbering) { %>checked<% } %> />
</label>
