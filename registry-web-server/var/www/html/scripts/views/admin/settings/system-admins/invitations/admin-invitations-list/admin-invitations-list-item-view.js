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
	'text!templates/admin/settings/system-admins/invitations/admin-invitations-list/admin-invitations-list-item.tpl',
	'scripts/registry',
	'scripts/models/admin/admin-invitation',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
], function($, _, Backbone, Marionette, Template, Registry, AdminInvitation, ConfirmView, NotifyView, ErrorView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		tagName: 'tr',

		events: {
			'click .delete': 'onClickDelete'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model,
				url: Registry.application.getURL() + '#accounts',
				showDelete: this.options.showDelete
			}));
		},

		//
		// event handling methods
		//

		onClickDelete: function() {
			var self = this;

			// show confirm dialog
			//
			Registry.application.modal.show(
				new ConfirmView({
					title: "Delete Administrator Invitation",
					message: "Are you sure that you want to delete this administrator invitation to " + this.model.get('invitee').getFullName() + "?",

					// callbacks
					//
					accept: function() {
						var adminInvitation = new AdminInvitation({
							'invitation_key': self.model.get('invitation_key')
						});

						// delete admin invitation
						//
						self.model.destroy({
							url: adminInvitation.url(),

							// callbacks
							//
							error: function() {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Could not delete this admin invitation."
									})
								);
							}
						});
					}
				})
			);
		}
	});
});
