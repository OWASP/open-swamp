/******************************************************************************\
|                                                                              |
|                             projects-nav-list-view.js                        |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing lists of the user's projects.       |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/projects/nav-list/projects-nav-list.tpl',
	'scripts/registry',
	'scripts/models/permissions/user-permission',
	'scripts/views/users/dialogs/project-ownership/project-ownership-policy-view',
	'scripts/views/users/dialogs/project-ownership/project-ownership-status-view'
], function($, _, Backbone, Marionette, Template, Registry, UserPermission, ProjectOwnershipPolicyView, ProjectOwnershipStatusView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		events: {
			'click #add-new-project': 'onClickAddNewProject',
			'click #review-projects': 'onClickReviewProjects'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				user: Registry.application.session.user,
				ownedProjects: this.collection.getProjectsOwnedBy(Registry.application.session.user),
				joinedProjects: this.collection.getProjectsNotOwnedBy(Registry.application.session.user)
			}));
		},

		onRender: function() {

			// update sidebar navigation highlighting
			//
			if (this.options.nav) {
				this.$el.find('.nav li').removeClass('active');
				this.$el.find('.nav li.' + this.options.nav).addClass('active');
			}
		},

		//
		// event handling methods
		//

		onClickAddNewProject: function() {

			// check to see if user has project owner permissions
			//
			if (Registry.application.session.user.isOwner()) {
				Backbone.history.navigate('#projects/add', {
					trigger: true
				});
			} else {

				// fetch then render
				//
				var project_owner_permission = new UserPermission({ 
					'user_uid': Registry.application.session.user.get('user_uid'),
					'permission_code': 'project-owner'
				});
				project_owner_permission.fetch({

					// callbacks
					//
					success: function() {

						// show project ownership status dialog box
						//
						Registry.application.modal.show(
							new ProjectOwnershipStatusView({
								model: project_owner_permission
							})
						);
					},

					error: function() {

						// show project ownership policy dialog box
						//
						Registry.application.modal.show(
							new ProjectOwnershipPolicyView({
								model: project_owner_permission,
								className: 'wide'
							})
						);
					}
				});			
			}
		},

		onClickReviewProjects: function() {
			Backbone.history.navigate('#projects/review', {
				trigger: true
			});	
		}
	});
});
