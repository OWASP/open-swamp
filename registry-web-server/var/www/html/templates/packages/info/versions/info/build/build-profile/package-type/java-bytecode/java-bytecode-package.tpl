<div id="java-bytecode-package-info">
	<fieldset>
		<legend>Java bytecode info</legend>

		<div class="control-group">
			<label class="form-label">Class path</label>
			<span><%= bytecode_class_path %></span>
		</div>

		<br />
		<div class="control-group">
			<% var showAdvanced = (bytecode_aux_class_path || bytecode_source_path); %>
			<div class="accordion" id="advanced-settings-accordion">
				<div class="accordion-group">
					<div class="accordion-heading">
						<label>
						<a class="accordion-toggle" data-toggle="collapse" data-parent="#advanced-settings-accordion" href="#advanced-settings">
							<i class="fa fa-minus-circle"></i>
							Advanced settings
						</a>
						</label>
					</div>
					<div id="advanced-settings" class="nested accordion-body collapse in">
						<% if (showAdvanced) { %>

						<% if (bytecode_aux_class_path) { %>
						<div class="control-group">
							<label class="form-label">Aux class path</label>
							<span><%= bytecode_aux_class_path %></span>
						</div>
						<% } %>

						<% if (bytecode_source_path) { %>
						<div class="control-group">
							<label class="form-label">Source path</label>
							<span><%= bytecode_source_path %></span>
						</div>
						<% } %>

						<% } else { %>
						<p>No advanced settings have been defined. </p>
						<% } %>
					</div>
				</div>
			</div>
		</div>
	</fieldset>
</form>
