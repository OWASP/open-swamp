/******************************************************************************\ 
|                                                                              |
|                              file-types-list-view.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a package version's source          |
|        file types.                                                           |
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
	'text!templates/files/file-types-list/file-types-list.tpl',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/files/file-types-list/file-types-list-item-view'
], function($, _, Backbone, Marionette, TableSorter, Template, SortableTableListView, FileTypesListItemView) {
	return SortableTableListView.extend({

		//
		// attributes
		//

		childView: FileTypesListItemView,

		sorting: {

			// sort on count column in descending order 
			//
			sortList: [[1, 1]]
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
