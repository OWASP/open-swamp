<div class="accordion-inner">
	<i class="fa fa-minus-circle close accordion-toggle" data-toggle="collapse" href="#limit-filter" />

	<h3><i class="fa fa-caret-left"></i>Limit filter</h3>
	<div class="row-fluid">
		<div class="control-group">
			<label class="control-label">Maximum # of results to display</label>
			<div class="controls">
				<input type="number" id="limit" name="filter-number"<% if (limit) { %> value="<%= limit %>"<% } %> title="Please enter a positive number." min="0" max="1000" step="1" />
			</div>
		</div>
	</div>

	<div align="right">
		<button id="reset" class="btn btn-small"><i class="fa fa-times"></i>Reset</button>
	</div>
</div>
