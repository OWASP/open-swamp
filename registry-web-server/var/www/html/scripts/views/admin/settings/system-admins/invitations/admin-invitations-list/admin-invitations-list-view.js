/******************************************************************************\
|                                                                              |
|                               admin-invitations-view.js                      |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view that shows administrator invitations.             |
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
	'text!templates/admin/settings/system-admins/invitations/admin-invitations-list/admin-invitations-list.tpl',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/admin/settings/system-admins/invitations/admin-invitations-list/admin-invitations-list-item-view'
], function($, _, Backbone, Marionette, TableSorter, Template, SortableTableListView, AdminInvitationsListItemView) {
	return SortableTableListView.extend({

		//
		// attributes
		//

		childView: AdminInvitationsListItemView,

		sorting: {

			// disable sorting on remove column
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

			// set item remove callback
			//
			this.collection.bind('remove', function() {
				this.render();
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
				showDelete: this.options.showDelete
			}
		}
	});
});
