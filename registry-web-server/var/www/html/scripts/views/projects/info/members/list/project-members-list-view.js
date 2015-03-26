/******************************************************************************\
|                                                                              |
|                           project-members-list-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a list of project members.          |
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
	'text!templates/projects/info/members/list/project-members-list.tpl',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/projects/info/members/list/project-members-list-item-view'
], function($, _, Backbone, Marionette, TableSorter, Template, SortableTableListView, ProjectMembersListItemView) {
	return SortableTableListView.extend({

		//
		// attributes
		//

		childView: ProjectMembersListItemView,

		sorting: {

			// disable sorting on admin and delete columns
			//
			headers: { 
				4: { 
					sorter: false 
				},
				5: { 
					sorter: false 
				}
			},

			// sort on date column in descending order 
			//
			sortList: [[3, 1]]
		},

		//
		// methods
		//

		initialize: function() {
			var self = this;

			// set item remove callback
			//
			this.collection.bind('remove', function() {
				self.render();
			}, this);
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				collection: this.collection,
				showDelete: this.options.showDelete
			}));
		},

		childViewOptions: function(model, index) {
			return {
				project: this.options.model,
				model: model,
				collection: this.collection,
				projectMembership: this.options.projectMemberships.at(index),
				currentProjectMembership: this.options.currentProjectMembership,
				projectMemberships: this.options.projectMemberships,
				showDelete: this.options.showDelete
			}   
		}
	});
});
