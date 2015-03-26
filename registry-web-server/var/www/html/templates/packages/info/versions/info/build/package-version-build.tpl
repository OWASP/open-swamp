<div id="build-info">
	<p>The following parameters are used to configure the build script which is used to build the package. </p>
	<br />
	<div id="build-profile"></div>
	<div class="control-group">
		<div class="accordion" id="build-script-accordion" <% if (build_system == 'no-build' || build_system == 'none') { %>style="display:none"<% } %> >
			<div class="accordion-group">
				<div class="accordion-heading">
					<label>
					<a class="accordion-toggle" data-toggle="collapse" data-parent="#build-script-accordion" href="#build-script-info">
						<i class="fa fa-minus-circle" />
						Build script
					</a>
					</label>
				</div>
				<div id="build-script-info" class="nested accordion-body collapse in">
					<div id="build-script"></div>
				</div>
			</div>
		</div>
	</div>

	<div class="alert alert-error" style="display:none">
		<button type="button" class="close" data-dismiss="alert"><i class="fa fa-close"></i></button>
		<label>Error: </label><span class="message">This form contains errors.  Please correct and resubmit.</span>
	</div>
</div>

<div class="buttons">
	<% if (package.isOwned()) { %>
	<button id="edit" class="btn btn-primary btn-large"><i class="fa fa-pencil"></i>Edit Build Info</button>
	<% } %>
	<% if (showNavigation) { %>
	<button id="cancel" class="btn btn-large"><i class="fa fa-times"></i>Cancel</button>
	<button id="prev" class="btn btn-large"><i class="fa fa-arrow-left"></i>Prev</button>
	<% if (package.isOwned()) { %>
	<button id="next" class="btn btn-large"><i class="fa fa-arrow-right"></i>Next</button>
	<% } else { %>
	<button id="start" class="btn btn-large"><i class="fa fa-fast-backward"></i>Start</button>
	<% } %>
	<% } %>
</div>
