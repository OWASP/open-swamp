/******************************************************************************\
|                                                                              |
|                                  my-account-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for viewing the user's account information.       |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/users/accounts/my-account.tpl',
	'scripts/registry',
	'scripts/collections/projects/project-memberships',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/users/user-profile/user-profile-view',
	'scripts/views/users/accounts/change-password/change-my-password-view',
	'scripts/views/users/accounts/change-permissions/change-my-permissions-view',
	'scripts/views/users/accounts/change-linked-accounts/change-my-linked-accounts-view',
	'scripts/views/users/accounts/edit/edit-my-account-view'
], function($, _, Backbone, Marionette, Template, Registry, ProjectMemberships, ConfirmView, NotifyView, ErrorView, UserProfileView, ChangeMyPasswordView, ChangeMyPermissionsView, ChangeMyLinkedAccountsView, EditMyAccountView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		template: _.template(Template),

		regions: {
			userProfile: "#user-profile"
		},

		events: {
			"click #profile": "onClickProfile",
			"click #edit": "onClickEdit",
			"click #password": "onClickPassword",
			"click #permissions": "onClickPermissions",
			"click #accounts": "onClickAccounts",
			"click #delete-account": "onClickDeleteAccount"
		},

		//
		// methods
		//

		initialize: function() {

			// set model to current user
			//
			this.model = Registry.application.session.user;
		},

		//
		// rendering methods
		//

		onRender: function() {

			// update top navigation
			//
			switch (this.options.nav) {
				case "password":
					this.$el.find(".nav li").removeClass("active");
					this.$el.find(".nav li#password").addClass("active");
					break;
				case "permissions":
					this.$el.find(".nav li").removeClass("active");
					this.$el.find(".nav li#permissions").addClass("active");
					break;
				case "accounts":
					this.$el.find(".nav li").removeClass("active");
					this.$el.find(".nav li#accounts").addClass("active");
					break;
				default:
				case "edit":
				case "profile":
					this.$el.find(".nav li").removeClass("active");
					this.$el.find(".nav li#profile").addClass("active");
					break;
			}

			// display subviews
			//
			switch (this.options.nav) {
				case "password":
					var changeMyPasswordView = new ChangeMyPasswordView({
						el: this.$el.find("#user-profile"),
						model: this.model,
						parent: this
					});
					changeMyPasswordView.render();
					break;
				case "permissions":
					var changeMyPermissionsView = new ChangeMyPermissionsView({
						el: this.$el.find("#user-profile"),
						model: this.model,
						parent: this
					});
					changeMyPermissionsView.render();
					break;
				case "accounts":
					var changeMyLinkedAccountsView = new ChangeMyLinkedAccountsView({
						el: this.$el.find("#user-profile"),
						model: this.model,
						parent: this
					});
					changeMyLinkedAccountsView.render();
					break;
				case "edit":
					var editMyAccountView = new EditMyAccountView({
						el: this.$el.find("#user-profile"),
						model: this.model,
						parent: this
					});
					editMyAccountView.render();
					break;
				default:
				case "profile":
					var userProfileView = new UserProfileView({
						el: this.$el.find("#user-profile"),
						model: this.model,
						parent: this
					});
					userProfileView.render();
					break;

			}

		},

		//
		// utility methods
		//

		deleteAccount: function() {
			var self = this;

			// confirm delete
			//
			Registry.application.modal.show(
				new ConfirmView({
					title: "Delete My Account",
					message: "Are you sure that you would like to delete your user account? " +
						"When you delete an account, all of the user data will continue to be retained.",

					// callbacks
					//
					accept: function() {

						// delete user
						//
						self.model.destroy({

							// callbacks
							//
							success: function() {

								// show success notification dialog
								//
								Registry.application.modal.show(
									new NotifyView({
										title: "My Account Deleted",
										message: "Your user account has been successfuly deleted.",

										// callbacks
										//
										accept: function() {

											// end session
											//
											Registry.application.session.logout({

												// callbacks
												//
												success: function(){
													window.location.reload();
												},
												
												error: function(jqxhr, textstatus, errorThrown) {

													// show error dialog
													//
													Registry.application.modal.show(
														new ErrorView({
															message: "Could not log out: " + errorThrown + "."
														})
													);
												}
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
										message: "Could not delete your user account."
									})
								);
							}
						});
					}
				})
			);
		},

		//
		// event handling methods
		//
		onClickProfile: function() {
			Backbone.history.navigate("#my-account", {
				trigger: true
			});
		},

		onClickEdit: function() {
			Backbone.history.navigate("#my-account/edit", {
				trigger: true
			});
		},

		onClickPassword: function() {
			Backbone.history.navigate("#my-account/password", {
				trigger: true
			});
		},

		onClickDeleteAccount: function() {
			this.deleteAccount();
		},

		onClickPermissions: function() {
			Backbone.history.navigate("#my-account/permissions", {
				trigger: true
			});
		},

		onClickAccounts: function() {
			Backbone.history.navigate("#my-account/accounts", {
				trigger: true
			});
		}

	});
});
