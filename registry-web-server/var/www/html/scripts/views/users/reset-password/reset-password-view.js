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
	'text!templates/users/reset-password/reset-password.tpl',
	'scripts/registry',
	'scripts/utilities/password-policy',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view'
], function($, _, Backbone, Marionette, Validate, Tooltip, Clickover, Template, Registry, PasswordPolicy, NotifyView, ErrorView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				user: this.options.user
			}));
		},

		events: {
			'click #submit': 'onClickSubmit',
			'click #cancel': 'onClickCancel'
		},

		//
		// methods
		//

		initialize: function() {
			var self = this;
			
			// add password validation rule
			//
			$.validator.addMethod('passwordStrongEnough', function(value) {
				var username = self.options.user.get('username');
				var passwordRating = $.validator.passwordRating(value, username);
				return (passwordRating.messageKey === 'strong');
			}, "Your password must be stronger.");
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

		showWarning: function() {
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
						equalTo: '#password'
					}
				},

				messages: {
					'password': {
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

		onClickSubmit: function() {
			var self = this;

			// check validation
			//
			if (this.isValid()) {

				// get values from form
				//
				var password = this.$el.find('#password').val();
				var confirmPassword = this.$el.find('#confirm-password').val();

				// confirm password spelling
				//
				if (password !== confirmPassword) {
					this.$el.find('.error').html("Passwords do not match. ");
					this.$el.find('.alert').show();
					return;
				}

				// change password
				//
				this.options.user.resetPassword( password, {
					password_reset_key: this.model.get('password_reset_key'),
					password_reset_id: this.model.get('password_reset_id'),

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

									// go home
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
								message: "Error removing pending password reset."
							})
						);
					}	
				});
			} else {

				// display error message
				//
				this.showWarning();
			}
		},

		onClickCancel: function() {

			// go home
			//
			Backbone.history.navigate('#home', {
				trigger: true
			});
			window.location.reload();
		}

	});
});

