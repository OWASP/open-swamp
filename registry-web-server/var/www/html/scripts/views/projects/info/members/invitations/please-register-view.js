/******************************************************************************\
|                                                                              |
|                              please-register-view.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view that shows project invitation confirmation        |
|        in the case that a user is not yet registered for the SWAMP.          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/projects/info/members/invitations/please-register.tpl',
	'scripts/registry',
	'scripts/views/dialogs/error-view',
	'scripts/views/dialogs/notify-view'
], function($, _, Backbone, Marionette, Template, Registry, ErrorView, NotifyView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		events: {
			'click #register': 'onClickRegister',
			'click #decline': 'onClickDecline'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				sender: this.options.sender,
				project: this.options.project
			}));
		},

		//
		// event handling methods
		//

		onClickRegister: function() {

			// go to register view
			//
			Backbone.history.navigate('#register', {
				trigger: true
			});
		},

		onClickDecline: function() {
			var self = this;

			// save project invitation
			//
			this.model.save({
				'status': 'declined'
			}, {
				// callbacks
				//
				success: function() {

					// show invitation declined notify dialog
					//
					Registry.application.modal.show(
						new NotifyView({
							title: "Invitation Declined",
							message: "Your invitation to the project '" + self.options.project.get('full_name') + "' by " + self.options.sender.getFullName() + " has been declined.",

							// callbacks
							//
							accept: function() {

								// go to home view
								//
								Backbone.history.navigate('#home', {
									trigger: true
								});
							}
						})
					);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not decline this project invitation."
						})
					);
				}
			});
		}
	});
});