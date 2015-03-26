/******************************************************************************\
|                                                                              |
|                               projects-list-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for displaying a list of projects.                |
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
	'text!templates/projects/list/projects-list.tpl',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/projects/list/projects-list-item-view'
], function($, _, Backbone, Marionette, TableSorter, Template, SortableTableListView, ProjectsListItemView) {
	return SortableTableListView.extend({

		//
		// attributes
		//

		childView: ProjectsListItemView,

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
				showDelete: this.options.showDelete,
				parent: this
			}
		}
	});
});