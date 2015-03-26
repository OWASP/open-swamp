<form action="/" class="form-horizontal">
	<div class="control-group">
		<label class="required control-label">Package path</label>
		<div class="controls">
			<input id="package-path" name="package-path" type="text" maxlength="200" class="required" value="<%= model.get('source_path') %>" data-toggle="popover" data-placement="right" title="Package path" data-content="This is the name of the directory / folder within the compressed package file that contains your package source code. " />
			<button id="select-package-path" class="btn"><i class="fa fa-list"></i>Select</button>
		</div>
	</div>

	<% var packageType = package.getPackageType() %>
	<div class="control-group">
		<label class="required control-label">Language</label>
		<div class="controls">
			<select id="language-type" name="language-type" class="select required" data-toggle="popover" data-placement="right" title="Please specify a language type." data-content="This is the type of programming language used for the code contained in the software package." >
				<% if (!packageType) { %>
				<option value="none"></option>
				<% } %>
				<option value="c" <% if (packageType == 'c-source') { %>selected<% } %>>C/C++</option>
				<option value="java" <% if (packageType == 'java-source' || packageType == 'java-bytecode') { %>selected<% } %>>Java</option>
				<option value="python" <% if (packageType == 'python2' || packageType == 'python3') { %>selected<% } %>>Python</option>
			</select>
			<button id="show-file-types" class="btn"><i class="fa fa-file"></i>Show File Types</button>
		</div>
	</div>

	<div class="control-group" id="java-type" <% if (packageType != 'java-source' && packageType != 'java-bytecode') { %>style="display:none"<% } %>>
		<div class="controls">
			<label class="radio">
				<input type="radio" name="java-type" value="java-source" <% if (packageType == 'java-source') { %>checked<% } %> />
				Java source
				<p>The package contains uncompiled Java code in its original source code format (.java files).</p>
			</label>
			<label class="radio">
				<input type="radio" name="java-type" value="java-bytecode" <% if (packageType != 'java-source') { %>checked<% } %> />
				Java bytecode
				<p>The package contains Java code which has been compiled into bytecodes (.class or .jar files).</p>
			</label>
			<label class="checkbox" id="android">
				<input type="checkbox" <% if (packageType == 'android-source' || packageType == 'android-bytecode') { %>checked<% } %> />
				Android
				<p>The package contains Java code for the Android platform.</p>
			</label>
		</div>
	</div>

	<div class="control-group" id="python-type" <% if (packageType != 'python2' && packageType != 'python3') { %>style="display:none"<% } %>>
		<div class="controls">
			<label class="radio">
				<input type="radio" name="python-type" value="python2" <% if (packageType != 'python3') { %>checked<% } %> />
				Python2
				<p>The package contains Python source code in its original (2000 - 2008) dialect (version 2.x).</p>
			</label>
			<label class="radio">
				<input type="radio" name="python-type" value="python3" <% if (packageType == 'python3') { %>checked<% } %> />
				Python3
				<p>The package contains Python source code in its most recent (2008 onwards) dialect (3.x).</p>
			</label>
		</div>
	</div>

	<div align="right">
		<h3><span class="required"></span>Fields are required</h3>
	</div>
</form>