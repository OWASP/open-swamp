/******************************************************************************\
|                                                                              |
|                          change-my-permissions-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|           This defines a view for changing the user's permissions.           |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'scripts/config',
	'scripts/registry',
	'scripts/models/permissions/policy',
	'scripts/models/permissions/user-permission',
	'scripts/collections/permissions/user-permissions',
	'text!templates/users/accounts/change-permissions/change-my-permissions.tpl',
	'scripts/views/users/info/permissions/select-permissions-list/select-permissions-list-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/users/dialogs/permission-comment-view'
], function($, _, Backbone, Marionette, Config, Registry, Policy, UserPermission, UserPermissions, Template, SelectPermissionsListView, NotifyView, ErrorView, PermissionCommentView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// methods
		//

		initialize: function() {
			this.model = Registry.application.session.user;
			this.collection = new UserPermissions();
		},

		showPermissionDialog: function(permission) {
			var self = this;
			
			// show permission comment dialog
			//
			Registry.application.modal.show(
				new PermissionCommentView({
					className: 'wide',
					permission: permission,
					message: '<p>Please review and accept the following policy statement and provide a comment explaining why you require this permission:</p>',

					// callbacks
					//
					accept: function(data) {
						$.ajax({
							type: 'POST',
							url: Config.registryServer + '/users/' + self.model.get('user_uid') + '/permissions',
							data: data,

							// callbacks
							//
							success: function() {

								// show success notification dialog
								//
								Registry.application.modal.show(
									new NotifyView({
										title: "Permission Requested",
										message: "Your permission has been requested.  The SWAMP staff will review your requests and respond to you shortly.",

										// callbacks
										//
										accept: function() {
											self.options.parent.render();
										}
									})
								);
							},

							error: function(response) {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Error: " + response.responseText
									})
								);
							}
						});
					}
				})
			);
		},

		requestPermission: function(permission) {
			var self = this;

			// fetch policy
			//
			if (permission.has('policy_code')) {
				var policy = new Policy({
					'policy_code': permission.get('policy_code')
				});
				policy.fetch({

					// callbacks
					//
					success: function() {
						permission.set({
							'policy': policy.get('policy')
						})
						self.showPermissionDialog(permission);
					},

					error: function() {

						// show error dialog
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "Could not fetch policy: " + policy.get('policy_code')
							})
						);
					}
				})
			} else {
				self.showPermissionDialog(permission);
			}
		},

		setPermission: function( permission ) {
			var self = this;
			Registry.application.modal.show(
				new PermissionCommentView({

					parent: this.options.parent,
					permission: permission,
					changeUserPermissions: true,
					className: 'wide',
					title: permission.get('title'),
					message: '<p>Please review and comment on this request:</p>',
					policy: '',

					// callbacks
					//
					accept: function( data ) {

						$.ajax({
							type: 'PUT',
							url: Config.registryServer + '/users/' + self.model.get('user_uid') + '/permissions',
							data: data,

							// callbacks
							//
							success: function() {

								// update parent view
								//
								self.options.parent.render();
							},

							error: function(response) {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Could not save permissions changes: " + response.responseText
									})
								);
							}
						});
					}
				})
			);
		},

		//
		// rendering methods
		//

		template: function(){
			return _.template(Template);
		},

		onRender: function() {

			// show list subview
			//
			this.showPermissionsList();
		},

		showPermissionsList: function() {
			var self = this;

			// fetch list of permissions for a user
			//
			this.collection.fetchByUser(self.model, {

				// callbacks
				//
				success: function() {

					// show select permissions list view
					//
					self.selectPermissionsList = new SelectPermissionsListView({
						el: self.$el.find('#select-permissions-list'),
						model: self.model,
						collection: self.collection,
						parent: self
					});
					self.selectPermissionsList.render();
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not get permissions for this user."
						})
					);
				}
			});
		}
	});
});
