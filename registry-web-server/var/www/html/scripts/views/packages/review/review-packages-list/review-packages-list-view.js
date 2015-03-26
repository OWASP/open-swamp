/******************************************************************************\
|                                                                              |
|                           review-packages-list-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for displaying a list of packages for review.     |
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
	'text!templates/packages/review/review-packages-list/review-packages-list.tpl',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/packages/review/review-packages-list/review-packages-list-item-view'
], function($, _, Backbone, Marionette, TableSorter, Template, SortableTableListView, ReviewPackagesListItemView) {
	return SortableTableListView.extend({

		//
		// attributes
		//

		childView: ReviewPackagesListItemView,

		sorting: {

			// disable sorting on delete column
			//
			headers: { 
				3: { 
					sorter: false 
				}
			},

			// sort on date column in descending order 
			//
			sortList: [[2, 1]]
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
				showNumbering: this.options.showNumbering,
				showDelete: this.options.showDelete
			}
		}
	});
});
