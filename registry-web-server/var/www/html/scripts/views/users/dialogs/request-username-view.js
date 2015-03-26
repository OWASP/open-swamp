/******************************************************************************\
|                                                                              |
|                            request-username-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an dialog box that is used to request a username.        |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/users/dialogs/request-username.tpl',
	'scripts/registry',
	'scripts/models/users/user',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view'
], function($, _, Backbone, Marionette, Template, Registry, User, NotifyView, ErrorView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		template: _.template(Template),

		events: {
			'click #email-address': 'onClickEmailAddress',
			'blur #email-address': 'onBlurEmailAddress',
			'click #request-username': 'onClickRequestUsername',
			'click #cancel': 'onClickCancel',
			'keypress': 'onKeyPress'
		},

		//
		// methods
		//

		requestUsernameByEmail: function(email) {
			var user = new User();

			// find user by username
			//
			user.requestUsernameByEmail(email, {

				// callbacks
				//
				success: function() {
					Registry.application.modal.show(
						new NotifyView({
							message: "If the email address you submitted matches a valid account, an email containing your username will be sent."
						})
					);
				},
		
				error: function(jqXHR) {
					Registry.application.modal.show(
						new ErrorView({
							message: jqXHR.responseText
						})
					);
				}
			});
		},

		//
		// event handling methods
		//

		onClickEmailAddress: function() {
		},

		onBlurEmailAddress: function() {
		},

		onClickRequestUsername: function() {

			var email = this.$el.find('#email-address').val();
			if (email) {
				this.requestUsernameByEmail(email);
			} else {

				// show notification dialog
				//
				Registry.application.modal.show(
					new NotifyView({
						message: "You must supply a user name or email address."
					})
				);
			}

			if (this.options.accept){
				this.options.accept();
			}
			this.hide();

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
				this.hide();
			}
		}
	});
});
