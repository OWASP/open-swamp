/******************************************************************************\
|                                                                              |
|                             change-my-password-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for changing the user's password.                 |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'validate',
	'tooltip',
	'clickover',
	'text!templates/users/accounts/change-password/change-my-password.tpl',
	'scripts/registry',
	'scripts/utilities/password-policy',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view'
], function($, _, Backbone, Marionette, Validate, Tooltip, Clickover, Template, Registry, PasswordPolicy, NotifyView, ErrorView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		template: _.template(Template),

		events: {
			"click .alert .close": "onClickAlertClose",
			"click #submit": "onClickSubmit",
			"click #reset": "onClickReset",
			"keydown #password": "onKeydownPassword"
		},

		//
		// methods
		//

		initialize: function() {
			var self = this;

			this.model = Registry.application.session.user;
			
			// add password validation rule
			//
			$.validator.addMethod("passwordStrongEnough", function(value) {
				var username = self.$el.find("#username").val();
				var passwordRating = $.validator.passwordRating(value, username);
				return (passwordRating.messageKey === "strong");
			}, "Your password must be stronger.");
		},

		changePassword: function(currentPassword, newPassword) {

			// change current user's password
			//
			this.model.changePassword(currentPassword, newPassword, {

				// callbacks
				//
				success: function() {

					// show success notification dialog
					//
					Registry.application.modal.show(
						new NotifyView({
							title: "My Password Changed",
							message: "Your user password has been successfully changed.",

							// callbacks
							//
							accept: function() {

								// return to my account view
								//
								Backbone.history.navigate("#my-account", {
									trigger: true
								});
							}
						})
					);
				},

				error: function(response) {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not save password changes: " + response.responseText
						})
					);
				}
			});
		},

		//
		// rendering methods
		//

		onRender: function() {

			// display tooltips on focus
			//
			this.$el.find("input, textarea").popover({
				trigger: 'focus'
			});

			// validate form
			//
			this.validator = this.validate();
		},

		showWarning: function() {
			this.$el.find(".alert-error").show();
		},

		hideWarning: function() {
			this.$el.find(".alert-error").hide();
		},

		//
		// form validation methods
		//

		validate: function() {
			return this.$el.find("form").validate({

				rules: {
					"password": {
						required: true,
						passwordStrongEnough: true
					},
					"confirm-password": {
						required: true,
						equalTo: "#new-password"
					}
				},

				messages: {
					"password": {
						required: "Enter a password."
					},
					"confirm-password": {
						required: "Re-enter your password.",
						equalTo: "Enter the same password as above."
					}
				},

				// callbacks
				//
				highlight: function(element) {
					$(element).closest('.control-group').removeClass('success').addClass('error');
				},

				success: function(element) {
					element
					.text('OK!').addClass('valid')
					.closest('.control-group').removeClass('error').addClass('success');
				}
			});
		},

		isValid: function() {
			return this.validator.form();
		},

		//
		// event handling methods
		//

		onClickAlertClose: function() {
			this.hideWarning();
		},

		onClickSubmit: function() {

			// check validation
			//
			if (this.isValid()) {

				// get values from form
				//
				var currentPassword = this.$el.find("#current-password").val();
				var newPassword = this.$el.find("#new-password").val();
				var confirmPassword = this.$el.find("#confirm-password").val();

	 			// confirm password spelling
				//
				if (newPassword !== confirmPassword) {
					this.$el.find(".error").html("Passwords do not match. ");
					this.$el.find(".alert").show();
				} else {
					this.changePassword(currentPassword, newPassword);
				}
			} else {

				// display error message
				//
				this.showWarning();
			}
		},

		onClickReset: function() {
			require([
				'scripts/views/users/dialogs/reset-password-view'
			], function (ResetPasswordView) {

				// show reset password view
				//
				Registry.application.modal.show(
					new ResetPasswordView({
						username: Registry.application.session.user.get('username'),
						parent: this
					})
				);
			});
		},

		onKeydownPassword: function(event) {
			var maxlength = $(event.currentTarget).attr("maxlength");
			if (maxlength) {
				var length = event.currentTarget.value.length;
				if (length >= maxlength) {

					// show password length notification dialog
					//
					Registry.application.modal.show(
						new NotifyView({
							message: "Your password may not exceed " + maxlength + " characters in length."
						})
					);
				}
			}
		}
	});
});
