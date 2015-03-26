/******************************************************************************\
|                                                                              |
|                             user-registration-view.js                        |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the introductory view of the application.                |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/users/registration/user-registration.tpl',
	'scripts/registry',
	'scripts/models/users/user',
	'scripts/models/users/email-verification',
	'scripts/views/dialogs/error-view',
	'scripts/views/users/dialogs/user-validation-error-view',
	'scripts/views/users/user-profile/new-user-profile-form-view',
	'scripts/views/users/registration/email-verification-view'
], function($, _, Backbone, Marionette, Template, Registry, User, EmailVerification, ErrorView, UserValidationErrorView, NewUserProfileFormView, EmailVerificationView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		template: _.template(Template),

		regions: {
			newUserProfile: '#new-user-profile'
		},

		events: {
			'click #aup': 'onClickAup',
			'click .alert .close': 'onClickAlertClose',
			'click #submit': 'onClickSubmit',
			'click #cancel': 'onClickCancel'
		},

		//
		// methods
		//

		initialize: function() {
			this.model = new User({});
		},

		verifyEmail: function() {
			var self = this;

			// create a new email verification
			//
			var emailVerification = new EmailVerification({
				user_uid: this.model.get('user_uid'),
				email: this.model.get('email')
			});

			// save email verification
			//
			emailVerification.save({
				verify_route: '#register/verify-email'
			}, {
				// callbacks
				//
				success: function() {

					// show email verification view
					//
					Registry.application.showMain(
						new EmailVerificationView({
							model: self.model
						})
					);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not save email verification."
						})
					);
				}
			});
		},

		//
		// rendering methods
		//

		onRender: function() {

			// display user profile form
			//
			this.newUserProfile.show(
				new NewUserProfileFormView({
					model: this.model
				})
			);

			// scroll to top
			//
			var el = this.$el.find('h1');
			el[0].scrollIntoView(true);
		},

		showWarning: function() {
			this.$el.find('.alert-error').show();
		},

		hideWarning: function() {
			this.$el.find('.alert-error').hide();
		},

		//
		// event handling methods
		//

		onClickAup: function() {
			Backbone.history.fragment = null;

			// go to aup view
			//
			Backbone.history.navigate('#register', {
				trigger: true
			});
		},

		onClickAlertClose: function() {
			this.hideWarning();
		},

		onClickSubmit: function() {
			var self = this;

			// check validation
			//
			if (this.newUserProfile.currentView.isValid()) {

				// update model from form
				//
				this.newUserProfile.currentView.update(this.model);

				// check to see if model is valid
				//
				var response = this.model.checkValidation(this.model.toJSON(), {

					// callbacks
					//
					success: function() {

						// create new user
						//
						self.model.save(undefined, {

							// callbacks
							//
							success: function() {

								// verify email
								//
								self.verifyEmail();
							},

							error: function() {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Could not create new user."
									})
								);
							}
						});
					},

					error: function() {
						var errors = JSON.parse(response.responseText);

						// show user validation dialog
						//
						Registry.application.modal.show(
							new UserValidationErrorView({
								errors: errors
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

			// go to home view
			//
			Backbone.history.navigate('#home', {
				trigger: true
			});
		}
	});
});
