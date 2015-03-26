/******************************************************************************\
|                                                                              |
|                               edit-my-account-view.js                        |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for editing the user's account information.       |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/users/accounts/edit/edit-my-account.tpl',
	'scripts/registry',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/users/dialogs/user-validation-error-view',
	'scripts/views/users/user-profile/user-profile-form-view'
], function($, _, Backbone, Marionette, Template, Registry, NotifyView, ErrorView, UserValidationErrorView, UserProfileFormView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		template: _.template(Template),

		regions: {
			userProfileForm: "#user-profile-form"
		},

		events: {
			"click .alert .close": "onClickAlertClose",
			"click #save": "onClickSave",
			"click #cancel": "onClickCancel"
		},

		//
		// methods
		//

		initialize: function() {
			this.model = Registry.application.session.user;
		},

		//
		// rendering methods
		//

		onRender: function() {
			this.userProfileForm.show(
				new UserProfileFormView({
					model: this.model
				})
			);
		},

		showWarning: function() {
			this.$el.find(".alert-error").show();
		},

		hideWarning: function() {
			this.$el.find(".alert-error").hide();
		},

		//
		// event handling methods
		//

		onClickAlertClose: function() {
			this.hideWarning();
		},

		onClickSave: function() {
			var self = this;

			// check validation
			//
			if (this.userProfileForm.currentView.isValid()) {

				// update model from form
				//
				this.userProfileForm.currentView.update(this.model);

				// check to see if model is valid
				//
				var response = this.model.checkValidation(this.model.changedAttributes(), {

					// callbacks
					//
					success: function() {

						// prevent ownership emails from being sent
						//
						self.model.unset(
							"owner"
						);

						// save user profile
						//
						self.model.save(undefined, {

							// callbacks
							//
							success: function() {

								// update user name in header (if changed)
								//
								Registry.application.header.currentView.render();

								// notify user
								//
								var message = "Your user profile has been successfully updated.";
								if (self.model.changed.email) {
									message = "An email verification link has been sent to your new email address. Please follow the link to change your email address. Your previous email address will remain in effect until you do so.<br><br>" + message;
								}

								// show success notification dialog
								//
								Registry.application.modal.show(
									new NotifyView({
										title: "My Profile Updated",
										message: message,

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

							error: function() {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Could not save user profile changes."
									})
								);
							}
						});
					},

					error: function() {
						var errors = JSON.parse(response.responseText);

						// show validation errors dialog
						//
						Registry.application.modal.show(
							new UserValidationErrorView({
								errors: errors
							})
						);
					}
				});
			} else {
				this.showWarning();
			}
		},

		onClickCancel: function() {

			// go to my account view
			//
			Backbone.history.navigate("#my-account", {
				trigger: true
			});
		}
	});
});
