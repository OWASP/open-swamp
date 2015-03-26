/******************************************************************************\
|                                                                              |
|                               packages-list-view.js                          |
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
	'text!templates/packages/list/packages-list.tpl',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/packages/list/packages-list-item-view'
], function($, _, Backbone, Marionette, Template, SortableTableListView, PackagesListItemView) {
	return SortableTableListView.extend({

		//
		// attributes
		//

		childView: PackagesListItemView,

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
				showNumbering: this.options.showNumbering,
				showDelete: this.options.showDelete
			}));
		},

		childViewOptions: function(model, index) {
			return {
				index: index,
				showDelete: this.options.showDelete,
				showNumbering: this.options.showNumbering,
				showDeactivatedPackages: this.options.showDeactivatedPackages
			}
		}
	});
});