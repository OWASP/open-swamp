<form action="/" class="form-horizontal">
	<div class="control-group">
		<label class="required control-label">Name</label>
		<div class="controls">
			<input type="text" name="name" id="name" maxlength="100" class="required" data-toggle="popover" data-placement="right" title="Name" data-content="The name of your software package, excluding the version." value="<%= model.get('name') %>" />
		</div>
	</div>

	<div class="control-group">
		<label class="control-label">Description</label>
		<div class="controls">
			<textarea id="description" name="description" rows="3" maxlength="200" data-toggle="popover" data-placement="left" title="Description" data-content="Please include a short description of your package."><%= model.get('description') %></textarea>
		</div>
	</div>

	<div class="control-group">
		<label class="control-label">External URL</label>
		<div class="controls">
			<input id="external-url" name="external-url" type="text" class="external-url" data-toggle="popover" data-placement="right" title="External URL" data-content="The External URL is the address from which the SWAMP will attempt to clone or pull files for the package. Currently, only publicly clonable GitHub repository URLs are allowed. You may copy the URL from the &quot;HTTPS clone URL&quot; displayed on your GitHub repository page. The default branch will be used. Example: https://github.com/htcondor/htcondor.git" value="<%= model.get('external_url') %>" />
		</div>
	</div>

	<% if (package_type_id == undefined) { %>
	<div class="control-group">
		<label class="required control-label">Language</label>
		<div class="controls">
			<select id="language-type" name="package-type" class="select required" data-toggle="popover" data-placement="right" title="Please specify a language type." data-content="This is the type of programming language used for the code contained in the software package." >
				<option value="none"></option>
				<option value="c">C/C++</option>
				<option value="java">Java</option>
				<option value="python">Python</option>
			</select>
		</div>
	</div>

	<div class="control-group" id="java-type" style="display:none">
		<div class="controls">
			<label class="radio">
				<input type="radio" name="java-type" value="java-source" checked />
				Java source
				<p>The package contains uncompiled Java code in its original source code format (.java files).</p>
			</label>
			<label class="radio">
				<input type="radio" name="java-type" value="java-bytecode" />
				Java bytecode
				<p>The package contains Java code which has been compiled into bytecodes (.class or .jar files).</p>
			</label>
		</div>
	</div>

	<div class="control-group" id="python-type" style="display:none">
		<div class="controls">
			<label class="radio">
				<input type="radio" name="python-type" value="python2" checked />
				Python2
				<p>The package contains Python source code in its original (2000 - 2008) dialect (version 2.x).</p>
			</label>
			<label class="radio">
				<input type="radio" name="python-type" value="python3" />
				Python3
				<p>The package contains Python source code in its most recent (2008 onwards) dialect (3.x).</p>
			</label>
		</div>
	</div>
	<% } %>

	<div align="right">
		<h3><span class="required"></span>Fields are required</h3>
	</div>
</form>
