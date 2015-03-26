/******************************************************************************\
|                                                                              |
|                                 user-account-view.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for viewing a user's account information.         |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/users/accounts/user-account.tpl',
	'scripts/registry',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/users/user-profile/user-profile-view',
	'scripts/views/users/accounts/change-password/change-user-password-view',
	'scripts/views/users/accounts/change-permissions/change-user-permissions-view',
	'scripts/views/users/accounts/change-linked-accounts/change-user-linked-accounts-view'
], function($, _, Backbone, Marionette, Template, Registry, ConfirmView, NotifyView, ErrorView, UserProfileView, ChangeUserPasswordView, ChangeUserPermissionsView, ChangeUserLinkedAccountsView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		template: _.template(Template),

		regions: {
			userProfile: '#user-profile'
		},

		events: {
			'click #profile': 'onClickProfile',
			'click #edit': 'onClickEdit',
			'click #password': 'onClickPassword',
			'click #permissions': 'onClickPermissions',
			'click #accounts': 'onClickAccounts',
			'click #delete-account': 'onClickDeleteAccount'
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

			// update top navigation
			//
			switch (this.options.nav) {
				case 'password':
					this.$el.find('.nav li').removeClass('active');
					this.$el.find('.nav li#password').addClass('active');
					break;
				case 'permissions':
					this.$el.find('.nav li').removeClass('active');
					this.$el.find('.nav li#permissions').addClass('active');
					break;
				case 'accounts':
					this.$el.find('.nav li').removeClass('active');
					this.$el.find('.nav li#accounts').addClass('active');
					break;
				default:
				case 'edit':
				case 'profile':
					this.$el.find('.nav li').removeClass('active');
					this.$el.find('.nav li#profile').addClass('active');
					break;
			}

			// display subviews
			//
			switch (this.options.nav) {
				case 'password':
					this.userProfile.show(
						new ChangeUserPasswordView({
							model: this.model,
							parent: this
						})
					);
					break;
				case 'permissions':
					this.userProfile.show(
						new ChangeUserPermissionsView({
							model: this.model,
							parent: this
						})
					);
					break;
				case 'accounts':
					this.userProfile.show(
						new ChangeUserLinkedAccountsView({
							model: this.model,
							parent: this
						})
					);
					break;
				case 'profile':
					this.userProfile.show(
						new UserProfileView({
							model: this.model,
							parent: this
						})
					);
					break;
			}
		},

		//
		// event handling methods
		//
		
		onClickProfile: function() {
			Backbone.history.navigate('#accounts/' + this.model.get('user_uid'), {
				trigger: true
			});
		},

		onClickEdit: function() {
			Backbone.history.navigate('#accounts/' + this.model.get('user_uid') + '/edit', {
				trigger: true
			});
		},

		onClickPassword: function() {
			Backbone.history.navigate('#accounts/' + this.model.get('user_uid') + '/password', {
				trigger: true
			});
		},

		onClickPermissions: function() {
			Backbone.history.navigate('#accounts/' + this.model.get('user_uid') + '/permissions', {
				trigger: true
			});
		},

		onClickAccounts: function() {
			Backbone.history.navigate('#accounts/' + this.model.get('user_uid') + '/accounts', {
				trigger: true
			});
		},

		onClickDeleteAccount: function() {
			var self = this;

			// show confirm dialog
			//
			Registry.application.modal.show(
				new ConfirmView({
					title: "Delete User Account",
					message: "Are you sure that you would like to delete " +
						this.model.getFullName() + "'s user account? " +
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
										title: "User Account Deleted",
										message: "This user account has been successfuly deleted.",

										// callbacks
										//
										accept: function() {

											// return to review accounts view
											//
											Backbone.history.navigate('#accounts/review', {
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
										message: "Could not delete this user account."
									})
								);
							}
						});
					}
				})
			);
		},


		onClickCancel: function() {
			Backbone.history.navigate('#accounts/review', {
				trigger: true
			});
		}
	});
});
