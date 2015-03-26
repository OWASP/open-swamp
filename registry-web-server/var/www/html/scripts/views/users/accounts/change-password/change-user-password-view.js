/******************************************************************************\
|                                                                              |
|                            change-user-password-view.js                      |
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
	'text!templates/users/accounts/change-password/change-user-password.tpl',
	'scripts/registry',
	'scripts/utilities/password-policy',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view'
], function($, _, Backbone, Marionette, Validate, Tooltip, Clickover, Template, Registry, PasswordPolicy, NotifyView, ErrorView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		events: {
			'click .alert .close': 'onClickAlertClose',
			'click #submit': 'onClickSubmit',
			'keydown #password': 'onKeydownPassword'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				user: this.model
			}));
		},

		//
		// methods
		//

		initialize: function() {
			var self = this;
			
			// add password validation rule
			//
			$.validator.addMethod('passwordStrongEnough', function(value) {
				var username = self.$el.find('#username').val();
				var passwordRating = $.validator.passwordRating(value, username);
				return (passwordRating.messageKey === 'strong');
			}, "Your password must be stronger.");
		},

		changePassword: function(currentPassword, newPassword) {
			var self = this;

			// change some user's password
			//
			this.model.changePassword(currentPassword, newPassword, {

				// callbacks
				//
				success: function() {

					// show success notification dialog
					//
					Registry.application.modal.show(
						new NotifyView({
							title: "User Password Changed",
							message: self.model.getFullName() + "'s password has been successfully changed.",

							// callbacks
							//
							accept: function() {

								// return to user account view
								//
								Backbone.history.navigate('#accounts/' + self.model.get('user_uid'), {
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
			this.$el.find('input, textarea').popover({
				trigger: 'focus'
			});

			// validate form
			//
			this.validator = this.validate();
		},

		showWarning: function(message) {
			this.$el.find('.error').html(message);
			this.$el.find('.alert-error').show();
		},

		hideWarning: function() {
			this.$el.find('.alert-error').hide();
		},

		//
		// form validation methods
		//

		validate: function() {
			return this.$el.find('form').validate({

				rules: {
					'password': {
						required: true,
						passwordStrongEnough: true
					},
					'confirm-password': {
						required: true,
						equalTo: '#new-password'
					}
				},

				messages: {
					'swamp-password': {
						required: "Enter a password"
					},
					'confirm-password': {
						required: "Re-enter your password",
						equalTo: "Enter the same password as above"
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
				var newPassword = this.$el.find('#new-password').val();
				var confirmPassword = this.$el.find('#confirm-password').val();

	 			// confirm password spelling
				//
				if (newPassword !== confirmPassword) {
					this.$el.find('.error').html("Passwords do not match. ");
					this.$el.find('.alert').show();
				} else {
					this.changePassword(null, newPassword);
				}
			} else {

				// display error message
				//
				this.showWarning();
			}
		},

		onKeydownPassword: function(event) {
			var maxlength = $(event.currentTarget).attr('maxlength');
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
