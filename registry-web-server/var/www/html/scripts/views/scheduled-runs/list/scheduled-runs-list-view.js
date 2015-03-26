/******************************************************************************\
|                                                                              |
|                            scheduled-runs-list-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a list of scheduled runs.           |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/scheduled-runs/list/scheduled-runs-list.tpl',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/scheduled-runs/list/scheduled-runs-list-item-view'
], function($, _, Backbone, Marionette, Template, SortableTableListView, ScheduledRunsListItemView) {
	return SortableTableListView.extend({

		//
		// attributes
		//

		childView: ScheduledRunsListItemView,

		sorting: {

			// disable sorting on delete column
			//
			headers: {
				4: { 
					sorter: false 
				}
			},

			// sort on schedule in ascending order 
			//
			sortList: [[3, 0]]
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				collection: this.collection,
				showNumbering: this.options.showNumbering,
				showDelete: this.options.showDelete
			}));
		},

		childViewOptions: function(model, index) {
			return {
				index: index,
				showDelete: this.options.showDelete,
				showNumbering: this.options.showNumbering
			}
		}
	});
});