/******************************************************************************\
|                                                                              |
|                          project-invitations-list-view.js                    |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view that shows a list a user project invitations.     |
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
	'text!templates/projects/info/members/invitations/project-invitations-list/project-invitations-list.tpl',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/projects/info/members/invitations/project-invitations-list/project-invitations-list-item-view'
], function($, _, Backbone, Marionette, TableSorter, Template, SortableTableListView, ProjectInvitationsListItemView) {
	return SortableTableListView.extend({

		//
		// attributes
		//

		childView: ProjectInvitationsListItemView,

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
			sortList: [[2, 1]]
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

		childViewOptions: function() {
			return {
				project: this.options.model,
				showDelete: this.options.showDelete
			}   
		}
	});
});
