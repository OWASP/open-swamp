<div class="accordion-inner" id="date-filter">
	<i class="fa fa-minus-circle close accordion-toggle" data-toggle="collapse" href="#date-filter" />

	<h3><i class="fa fa-calendar"></i>Date filter</h3>
	<div class="row-fluid">
		<div class="span6">
			<label>After</label>
			<input id="after-date" type="date" <% if (afterDate) { %> value="<%= afterDate %>"<% } %> />
		</div>
		<div class="span6">
			<label>Before</label>
			<input id="before-date" type="date"<% if (beforeDate) { %> value="<%= beforeDate %>"<% } %> />
		</div>
	</div>

	<div align="right">
		<button id="reset" class="btn btn-small"><i class="fa fa-times"></i>Reset</button>
	</div>
</div>
