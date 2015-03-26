/******************************************************************************\
|                                                                              |
|                              reset-password-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an dialog box that is used to reset a password.          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/users/dialogs/reset-password.tpl',
	'scripts/registry',
	'scripts/models/users/password-reset',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view'
], function($, _, Backbone, Marionette, Template, Registry, PasswordReset, NotifyView, ErrorView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		events: {
			'click #swamp-username': 'onClickUsername',
			'blur #swamp-username': 'onBlurUsername',
			'click #email-address': 'onClickEmailAddress',
			'blur #email-address': 'onBlurEmailAddress',
			'click #reset-password': 'onClickResetPassword',
			'click #cancel': 'onClickCancel',
			'keypress': 'onKeyPress'
		},

		//
		// methods
		//

		resetPassword: function(data) {
			var self = this;
			var passwordReset = new PasswordReset({});
			
			passwordReset.save({
				data: data,

				// callbacks
				//
				success: function() {

					// show success notification view
					//
					if (self.options.username) {
						Registry.application.modal.show(
							new NotifyView({
								message: "Please check your inbox for an email with a link that you may use to reset your password."
							})
						);
					} else {
						Registry.application.modal.show(
							new NotifyView({
								message: "If you supplied a valid username or email address you will be sent an email with a link that you may use to reset your password."
							})
						);
					}
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Your password could not be reset."
						})
					);
				}
			});
		},

		//
		// querying methods
		//

		getUsername: function() {
			return this.$el.find('#swamp-username').val();
		},

		getEmail: function() {
			return this.$el.find('#email-address').val();
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				showUser: this.options.username == undefined
			}));
		},

		//
		// event handling methods
		//

		onClickUsername: function() {

			// disable email address input
			//
			this.$el.find('#email-address').attr('disabled', 'true');
		},

		onBlurUsername: function() {
			if (this.$el.find('#swamp-username').val() !== '') {

				// disable email address input
				//
				this.$el.find('#email-address').attr('disabled', 'true');
			} else {

				// enable email address input
				//
				this.$el.find('#email-address').removeAttr('disabled');
			}
		},

		onClickEmailAddress: function() {

			// disable user name input
			//
			this.$el.find('#swamp-username').attr('disabled', 'true');
		},

		onBlurEmailAddress: function() {
			if (this.$el.find('#email-address').val() !== '') {

				// disable email address input
				//
				this.$el.find('#swamp-username').attr('disabled', 'true');
			} else {

				// enable email address input
				//
				this.$el.find('#swamp-username').removeAttr('disabled');
			}
		},

		onClickResetPassword: function() {

			// get username from options or form
			//
			if (this.options.username) {
				var username = this.options.username;
			} else {
				var username = this.getUsername();
			}

			// reset password by username or email
			//
			if (username) {
				this.resetPassword({ 'username': username });
			} else {
				var email = this.getEmail();
				if (email) {
					this.resetPassword({ 'email': email });
				} else {

					// show notification dialog
					//
					Registry.application.modal.show(
						new NotifyView({
							message: "You must supply a user name or email address."
						})
					);
				}
			}

			if (this.options.accept){
				this.options.accept();
			}

			// close dialog
			//
			this.destroy();

			// disable default form submission
			//
			return false;
		},

		onClickCancel: function() {
			if (this.options.reject) {
				this.options.reject();
			}
		},

		onKeyPress: function(event) {

			// respond to enter key press
			//
			if (event.keyCode === 13) {
				this.onClickResetPassword();
			}
		}
	});
});
