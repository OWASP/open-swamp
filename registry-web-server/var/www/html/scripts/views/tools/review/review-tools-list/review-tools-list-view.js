/******************************************************************************\
|                                                                              |
|                           review-tools-list-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for displaying a list of tools for review.        |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'tablesorter',
	'text!templates/tools/review/review-tools-list/review-tools-list.tpl',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/tools/review/review-tools-list/review-tools-list-item-view'
], function($, _, Backbone, Marionette, TableSorter, Template, SortableTableListView, ReviewToolsListItemView) {
	return SortableTableListView.extend({

		//
		// attributes
		//

		childView: ReviewToolsListItemView,

		sorting: {

			// disable sorting on delete column
			//
			headers: { 
				4: { 
					sorter: false 
				}
			},

			// sort on date column in descending order 
			//
			sortList: [[3, 1]]
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				collection: this.collection,
				showDeactivatedTools: this.options.showDeactivatedTools,
				showNumbering: this.options.showNumbering,
				showDelete: this.options.showDelete
			}));
		},

		childViewOptions: function(model, index) {
			return {
				index: index,
				showDeactivatedTools: this.options.showDeactivatedTools,
				showNumbering: this.options.showNumbering,
				showDelete: this.options.showDelete
			}
		}
	});
});