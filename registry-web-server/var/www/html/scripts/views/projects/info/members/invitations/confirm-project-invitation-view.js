/******************************************************************************\
|                                                                              |
|                        confirm-project-invitation-view.js                    |
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
	'text!templates/projects/info/members/invitations/confirm-project-invitation.tpl',
	'scripts/registry',
	'scripts/models/projects/project-membership',
	'scripts/views/dialogs/error-view',
	'scripts/views/dialogs/notify-view'
], function($, _, Backbone, Marionette, Template, Registry, ProjectMembership, ErrorView, NotifyView) {
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
				sender: this.options.sender,
				project: this.options.project,
				user: this.options.user
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

				// show success notify view
				//
				success: function() {
					Registry.application.modal.show(
						new NotifyView({
							title: "Project Membership Accepted",
							message: "Congratulations, " + self.model.get('invitee_name') + ".  You are now a member of the project '" + self.options.project.get('full_name') + "'.",

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
							message: "Could not accept project invitation."
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
				success: function() {

					// show success notify view
					//
					Registry.application.modal.show(
						new NotifyView({
							title: "Project Membership Declined",
							message: "Your invitation to the project '" + self.options.project.get('full_name') + "' by " + self.options.sender.getFullName() + " has been declined.",

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
							message: "Could not decline project invitation."
						})
					);
				}
			});
		}
	});
});
