/******************************************************************************\
|                                                                              |
|                              edit-user-account-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for editing a user's account information.         |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/users/accounts/edit/edit-user-account.tpl',
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
			userProfileForm: '#user-profile-form'
		},

		events: {
			'click .alert .close': 'onClickAlertClose',
			'click #save': 'onClickSave',
			'click #cancel': 'onClickCancel'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model
			}));
		},

		onRender: function() {
			this.userProfileForm.show(
				new UserProfileFormView({
					model: this.model
				})
			);
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
							'owner'
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
								var message = "This user profile has been successfully updated.";
								if (self.model.changed.email) {
									message = "An email verification link has been sent to the new email address. The previous email address will remain in effect until the new address is verified.<br><br>" + message;
								}

								// show success notification dialog
								//
								Registry.application.modal.show(
									new NotifyView({
										title: "User Profile Updated",
										message: message,

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
				this.showWarning();
			}
		},

		onClickCancel: function() {

			// go to user accounts view
			//
			Backbone.history.navigate('#accounts/' + this.model.get('user_uid'), {
				trigger: true
			});
		}
	});
});
