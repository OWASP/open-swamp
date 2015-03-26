/******************************************************************************\
|                                                                              |
|                                  sign-in-view.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an notification dialog that is used to show a            |
|        modal sign in dialog box.                                             |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/users/dialogs/sign-in.tpl',
	'scripts/registry',
	'scripts/config',
	'scripts/views/users/dialogs/email-verification-error-view'
], function($, _, Backbone, Marionette, Template, Registry, Config, EmailVerificationErrorView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		template: function(){
			return _.template(Template, {
				github_redirect: Config.registryServer + '/github/redirect'
			});
		},

		events: {
			'click #ok': 'onClickOk',
			'click .alert .close': 'onClickAlertClose',
			'click #reset-password': 'onClickResetPassword',
			'click #request-username': 'onClickRequestUsername',
			'keypress': 'onKeyPress'
		},

		//
		// rendering methods
		//

		showWarning: function(message) {
			this.$el.find('.alert-error .message').html(message);
			this.$el.find('.alert-error').show();
		},

		hideWarning: function() {
			this.$el.find('.alert-error').hide();
		},

		//
		// methods
		//

		showHome: function() {

			// remove event handlers
			//
			this.undelegateEvents();

			// go to home view
			//
			Backbone.history.navigate('#home', {
				trigger: true
			});
		},

		signIn: function() {
			var self = this;
			
			// get user information
			//
			Registry.application.session.getUser({
				success: function( user ){
					Registry.application.session.user = user;
					self.showHome();
				}
			});

			// close dialog
			//
			this.destroy();
		},

		requestLogin: function(username, password) {
			var self = this;

			// send login request
			//
			Registry.application.session.login(username, password, {
				crossDomain: true,
				
				// callbacks
				//
				success: function() {
					
					// sign in user
					//
					self.signIn();
				},

				error: function(response, statusText, errorThrown) {
					if (response.status == 403) {
						window.location = Registry.application.getURL() + 'block/index.html';
					} else {
						self.showWarning(response.responseText);
						if (response.responseText == "User email has not been verified.") {
							Registry.application.modal.show(
								new EmailVerificationErrorView({
									username: username,
									password: password
								})
							);
						}
					}
				}
			});
		},

		//
		// event handling methods
		//

		onClickOk: function() {
			var self = this;

			// make request to login web service
			//
			var username = this.$el.find('#swamp-username').val();
			var password = this.$el.find('#swamp-password').val();

			// make login request
			//
			this.requestLogin(username, password);
		},

		onClickAlertClose: function() {
			this.hideWarning();
		},

		onKeyPress: function(event) {

			// respond to enter key press
			//
			if (event.keyCode === 13) {
				this.onClickOk();
			}
		},

		onClickResetPassword: function() {
			require([
				'scripts/views/users/dialogs/reset-password-view'
			], function (ResetPasswordView) {

				// show reset password view
				//
				Registry.application.modal.show(
					new ResetPasswordView({
						parent: this
					})
				);
			});
		},

		onClickRequestUsername: function() {
			require([
				'scripts/views/users/dialogs/request-username-view'
			], function (RequestUsernameView) {

				// show request username view
				//
				Registry.application.modal.show(
					new RequestUsernameView({
						parent: this
					})
				);
			});
		}
	});
});
