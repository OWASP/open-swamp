<h1>
	<div><i class="fa fa-gift"></i></div>
	<% if (data['type']) { %>
	Review <span class="name"><%= data['type'] %></span> Packages
	<% } else { %>
	Review All Packages
	<% } %>
</h1>

<ol class="breadcrumb">
	<li><a href="#home"><i class="fa fa-home"></i>Home</a></li>
	<li><a href="#overview"><i class="fa fa-eye"></i>System Overview</a></li>
	<li><i class="fa fa-gift"></i>Review Packages</li>
</ol>

<div id="package-filters"></div>
<br />

<div id="review-packages-list">
	<div align="center"><i class="fa fa-spinner fa-spin fa-2x"></i><br/>Loading packages...</div>
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
