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
	'text!templates/admin/settings/system-admins/invitations/new-admin-invitations-list/new-admin-invitations-list-item.tpl',
	'scripts/registry',
	'scripts/models/admin/admin-invitation',
	'scripts/views/dialogs/confirm-view'
], function($, _, Backbone, Marionette, Template, Registry, AdminInvitation, ConfirmView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		tagName: 'tr',

		events: {
			'click .delete': 'onClickDelete',
			'blur .name': 'onBlurName',
			'blur .email': 'onBlurEmail'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model,
				showDelete: this.options.showDelete
			}));
		},

		//
		// event handling methods
		//

		onClickDelete: function() {
			var self = this;
			var message;

			if (this.model.has('invitee_name')) {
				message = "Are you sure you want to delete the administrator invitation of " + this.model.get('invitee_name') + "?";
			} else {
				message = "Are you sure you want to delete this administrator invitation?";
			}

			// show confirm dialog
			//
			Registry.application.modal.show(
				new ConfirmView({
					title: "Delete New Administrator Invitation",
					message: message,

					// callbacks
					//
					accept: function() {
						self.model.destroy();
					}
				})
			);
		},

		onBlurName: function( e ) {
			var name = $(e.target).val();
			if (name === '') {
				name = undefined;
			}
			this.model.set({
				'invitee_name': name
			});
		},

		onBlurEmail: function( e ) {
			var email = $(e.target).val();
			if (email === '') {
				email = undefined;
			}
			this.model.set({
				'email': email
			});
		}
	});
});
