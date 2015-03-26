/******************************************************************************\
|                                                                              |
|                           review-accounts-list-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for displaying a list of user accounts            |
|        for review.                                                           |
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
	'text!templates/users/review/review-accounts-list/review-accounts-list.tpl',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/users/review/review-accounts-list/review-accounts-list-item-view'
], function($, _, Backbone, Marionette, TableSorter, Template, SortableTableListView, ReviewAccountsListItemView) {
	return SortableTableListView.extend({

		//
		// attributes
		//

		childView: ReviewAccountsListItemView,

		sorting: {

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
				showNumbering: this.options.showNumbering
			}));
		},

		childViewOptions: function(model, index) {
			return {
				index: index,
				showDisabledAccounts: this.options.showDisabledAccounts,
				showNumbering: this.options.showNumbering
			}; 
		}
	});
});
