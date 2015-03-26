<div class="alert alert-info" style="display:none">
	<button type="button" class="close" data-dismiss="alert"><i class="fa fa-close"></i></button>
	<label>Notice: </label><span class="message"></span>
</div>

<p>The following parameters are used to configure the build script which is used to build the package. </p>
<br />
<div id="build-profile-form"></div>

<div align="right">
	<h3><span class="required"></span>Fields are required</h3>
</div>

<div class="alert alert-error" style="display:none">
	<button type="button" class="close" data-dismiss="alert"><i class="fa fa-close"></i></button>
	<label>Error: </label><span class="message">This form contains errors.  Please correct and resubmit.</span>
</div>

<div class="control-group">
	<div class="accordion" id="build-script-accordion" style="display:none">
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

<div class="buttons">
	<button id="next" class="btn btn-primary btn-large"><i class="fa fa-arrow-right"></i>Next</button>
	<button id="prev" class="btn btn-large"><i class="fa fa-arrow-left"></i>Prev</button>
	<button id="cancel" class="btn btn-large"><i class="fa fa-times"></i>Cancel</button>
</div>

