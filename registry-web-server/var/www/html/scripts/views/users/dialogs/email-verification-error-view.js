/******************************************************************************\
|                                                                              |
|                          email-verification-error-view.js                    |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an error dialog that is shown if a user with an          |
|        unverified email address tries to login.                              |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/users/dialogs/email-verification-error.tpl',
	'scripts/registry',
	'scripts/models/users/email-verification',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view'
], function($, _, Backbone, Marionette, Template, Registry, EmailVerification, NotifyView, ErrorView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		template: _.template(Template),

		events: {
			'submit': 'onSubmit',
			'keypress': 'onKeyPress',
			'click #resend': 'onClickResend'
		},

		//
		// event handling methods
		//

		onSubmit: function() {
			if (this.options.accept) {
				this.options.accept();
			}
			this.hide();

			// disable default form submission
			//
			return false;
		},

		onKeyPress: function(event) {

			// respond to enter key press
			//
			if (event.keyCode === 13) {
				this.onSubmit();
				this.hide();
			}
		},

		onClickResend: function() {

			var emailVerification = new EmailVerification();
			emailVerification.resend(this.options.username, this.options.password, {

				// callbacks
				//
				success: function() {
					Registry.application.modal.show(
						new NotifyView({
							message: "A new verification email has been sent to the email address that you registered with.  Please check your inbox for its arrival.  It make take a few seconds for it to arrive."
						})
					);
				},

				error: function() {
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not resend email verification."
						})
					);
				}
			});

		}
	});
});
