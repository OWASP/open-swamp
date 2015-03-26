/******************************************************************************\
|                                                                              |
|                                tools-list-view.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for displaying a list of tools.                   |
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
	'text!templates/tools/list/tools-list.tpl',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/tools/list/tools-list-item-view'
], function($, _, Backbone, Marionette, TableSorter, Template, SortableTableListView, ToolsListItemView) {
	return SortableTableListView.extend({

		//
		// attributes
		//

		childView: ToolsListItemView,

		sorting: {

			// sort on date column in descending order 
			//
			sortList: [[0, 0]]
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				collection: this.collection
			}));
		}
	});
});