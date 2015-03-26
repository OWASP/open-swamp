/******************************************************************************\
|                                                                              |
|                           new-admin-invitations-view.js                      |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view that shows a list of new admininstator            |
|        invitations.                                                          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/admin/settings/system-admins/invitations/new-admin-invitations-list/new-admin-invitations-list.tpl',
	'scripts/views/widgets/lists/table-list-view',
	'scripts/views/admin/settings/system-admins/invitations/new-admin-invitations-list/new-admin-invitations-list-item-view'
], function($, _, Backbone, Marionette, Template, TableListView, NewAdminInvitationsListItemView) {
	return TableListView.extend({

		//
		// attributes
		//

		childView: NewAdminInvitationsListItemView,

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
				showDelete: this.options.showDelete
			}
		},
	});
});
