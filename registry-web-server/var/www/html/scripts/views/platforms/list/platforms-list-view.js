/******************************************************************************\
|                                                                              |
|                               platforms-list-view.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for displaying a list of platforms.               |
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
	'text!templates/platforms/list/platforms-list.tpl',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/platforms/list/platforms-list-item-view'
], function($, _, Backbone, Marionette, TableSorter, Template, SortableTableListView, PlatformsListItemView) {
	return SortableTableListView.extend({

		//
		// attributes
		//

		childView: PlatformsListItemView,

		sorting: {

			// sort on name column in ascending order 
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