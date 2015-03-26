/******************************************************************************\
|                                                                              |
|                            assessment-runs-list-view.js                      |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a list of execution records.        |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'scripts/registry',
	'popover',
	'text!templates/assessment-results/assessment-runs/list/assessment-runs-list.tpl',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/assessment-results/assessment-runs/list/assessment-runs-list-item-view'
], function($, _, Backbone, Marionette, Registry, PopOvers, Template, SortableTableListView, AssessmentRunsListItemView) {
	return SortableTableListView.extend({

		//
		// attributes
		//

		childView: AssessmentRunsListItemView,

		sorting: {

			// disable sorting on results column
			//
			headers: { 
				5: { 
					sorter: false 
				},
				6: {
					sorter: false
				}
			},

			// sort on date column in descending order 
			//
			sortList: [[0, 1]]
		},

		//
		// methods
		//

		initialize: function() {
			if (this.options.sortList) {

				// use specified sort order 
				//
				this.sorting.sortList = this.options.sortList;
			}

			// call superclass method
			//
			SortableTableListView.prototype.initialize.call(this);
		},

		//
		// querying methods
		//

		getSortList: function() {
			var column;
			var direction;

			// find sorting column and direction
			//
			if (this.$el.find('table .headerSortUp').length > 0) {
				var el = this.$el.find('table .headerSortUp')[0];
				column = el.column;
				direction = 1;
			} else if (this.$el.find('table .headerSortDown').length > 0) {
				var el = this.$el.find('table .headerSortDown')[0];
				column = el.column;
				direction = 0;
			}

			// return sort list array
			//
			if (this.options.showNumbering) {
				return [[column - 1, direction]];
			} else {
				return [[column, direction]];
			}
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				collection: this.collection,
				showNumbering: this.options.showNumbering,
				showResults: this.options.showResults,
				showDelete: this.options.showDelete,
				showSsh: this.options.showSsh
			}));
		},

		childViewOptions: function(model, index) {
			return {
				model: model,
				index: index,
				project: this.model,
				viewers: this.options.viewers,
				checked: this.options.checked,
				queryString: this.options.queryString,
				showNumbering: this.options.showNumbering,
				showResults: this.options.showResults,
				showDelete: this.options.showDelete,
				showSsh: this.options.showSsh
			}
		},

		onRender: function() {

			// initialize popovers
			//
			this.$el.find("button").popover({
				trigger: 'hover',
				animation: true
			});

			// call superclass method
			//
			SortableTableListView.prototype.onRender.call(this);
		}
	});
});
