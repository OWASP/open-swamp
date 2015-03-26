<form action="/" class="form-horizontal">
	<% if( model.get('external_url') ){ %>
		<div class="control-group">
			<label class="control-label">Use External URL</label>
			<div class="controls">
				<input id="use-external-url" name="use_external_url" type="checkbox" checked="checked" class="use-external-url" style="width: 25px; min-width: 25px; margin: 0" data-toggle="popover" data-placement="right" title="Use External URL" data-content="The external url is the address the SWAMP will attempt to clone or pull from. No file is required." />
				<span style="display: inline-block; width: 400px"><%= model.get('external_url') %></span>
			</div>
		</div>
	<% } %>

	<div class="control-group">
		<label class="control-label">File</label>
		<div class="controls">
			<input id="archive" name="file" type="file" class="archive" data-toggle="popover" data-placement="top" title="File" data-content="The file is the compressed archive file containing the source code and other assorted files that make up the contents of your software package." />
			<br />
			<a id="formats-supported" data-toggle="popover" title="Formats" data-content=".zip, .tar, .tar.gz, .tgz, .tar.bz2, .tar.xz, .tar.Z, .jar .war .ear">formats supported</a>
		</div>
	</div>

	<div id="package-version-profile-form"></div>

	<div class="progress invisible">
		<div class="bar bar-success" style="width: 0%;"><span class="bar-text"></span></div>
	</div>
</form>

