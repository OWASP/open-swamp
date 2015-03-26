<h1><div><i class="fa fa-pencil"></i></div>Edit <span class="name"><%= tool_name %></span> Tool Version <span class="name"><%= version_string %></span></h1>

<ol class="breadcrumb">
	<li><a href="#home"><i class="fa fa-home"></i>Home</a></li>
	<li><a href="#resources"><i class="fa fa-institution"></i>Resources</a></li>
	<li><a href="#tools/public"><i class="fa fa-wrench"></i>Tools</a></li>
	<li><a href="#tools/<%= tool.get('tool_uuid') %>"><i class="fa fa-wrench"></i><%= tool_name %></a></li>
	<li><a href="#tools/versions/<%= model.get('tool_version_uuid') %>"><i class="fa fa-wrench"></i>Tool Version <%= version_string %></a></li>
	<li><i class="fa fa-pencil"></i>Edit Tool Version</i>
</ol>

<div id="tool-version-profile-form"></div>

<div class="buttons">
	<button id="save" class="btn btn-primary btn-large"><i class="fa fa-save"></i>Save</button>
	<button id="cancel" class="btn btn-large"><i class="fa fa-times"></i>Cancel</button>
</div>