<h1><div><i class="fa fa-folder-open"></i></div>Review Projects</h1>

<ol class="breadcrumb">
	<li><a href="#home"><i class="fa fa-home"></i>Home</a></li>
	<li><a href="#overview"><i class="fa fa-eye"></i>System Overview</a></li>
	<li><i class="fa fa-folder-open"></i>Review Projects</li>
</ol>

<div id="project-filters"></div>
<br />

<span class="pull-right">
	<span class="required"></span>Limit filter includes deactivated projects.</span>
<div>
	<label class="checkbox">
		Show deactivated projects:
		<input type="checkbox" id="show-deactivated-projects" <%= showDeactivatedProjects ? 'checked="checked"' : '' %> />
	</label>
</div>
<br />

<div id="review-projects-list">
	<div align="center"><i class="fa fa-spinner fa-spin fa-2x"></i><br/>Loading projects...</div>
</div>

<br />
<label class="checkbox">
	Show numbering
	<input type="checkbox" id="show-numbering" <% if (showNumbering) { %>checked<% } %> />
</label>

<div class="buttons">
	<button id="save" class="btn btn-primary btn-large"><i class="fa fa-save"></i>Save</button>
	<button id="cancel" class="btn btn-large"><i class="fa fa-times"></i>Cancel</button>
</div>
