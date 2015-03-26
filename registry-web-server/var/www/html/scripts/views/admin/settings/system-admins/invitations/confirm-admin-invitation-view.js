/******************************************************************************\
|                                                                              |
|                          confirm-admin-invitation-view.js                    |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view that shows project invitation confirmation.       |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/admin/settings/system-admins/invitations/confirm-admin-invitation.tpl',
	'scripts/registry',
	'scripts/models/admin/admin',
	'scripts/views/dialogs/error-view',
	'scripts/views/dialogs/notify-view'
], function($, _, Backbone, Marionette, Template, Registry, Admin, ErrorView, NotifyView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		events: {
			'click #accept': 'onClickAccept',
			'click #decline': 'onClickDecline'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				inviter: this.model.get('inviter'),
				invitee: this.model.get('invitee')
			}));
		},

		//
		// event handling methods
		//

		onClickAccept: function() {
			var self = this;

			// send accept request
			//
			this.model.accept({

				// callbacks
				//
				success: function(data) {

					// update model
					//
					self.model.set(data);

					// create admin membership
					//
					var admin = new Admin({
						user_uid: self.model.get('invitee_uid')
					});

					admin.save(undefined, {

						// callbacks
						//
						success: function() {

							// show invitation accepted notify dialog
							//
							Registry.application.modal.show(
								new NotifyView({
									title: "Administrator Invitation Accepted",
									message: "Congratulations, " + self.model.get('invitee').getFullName() + ".  You are now a SWAMP administrator.",

									// callbacks
									//
									accept: function() {

										// go to home view
										//
										Backbone.history.navigate('#home', {
											trigger: true
										});
										window.location.reload();
									}
								})
							);
						},

						error: function() {

							// show error dialog
							//
							Registry.application.modal.show(
								new ErrorView({
									message: "Could not save administrator."
								})
							);
						}
					});
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not accept administrator invitation."
						})
					);
				}
			});
		},

		onClickDecline: function() {
			var self = this;

			// send decline request
			//
			this.model.decline({

				// callbacks
				//
				success: function(data) {

					// update model
					//
					self.model.set(data);

					// show declined notification dialog
					//
					Registry.application.modal.show(
						new NotifyView({
							title: "Administrator Invitation Declined",
							message: "Your invitation to become a SWAMP administrator has been declined. ",

							// callbacks
							//
							accept: function() {

								// go to home view
								//
								Backbone.history.navigate('#home', {
									trigger: true
								});
								window.location.reload();
							}
						})
					);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not decline administrator invitation."
						})
					);
				}
			});
		}
	});
});
