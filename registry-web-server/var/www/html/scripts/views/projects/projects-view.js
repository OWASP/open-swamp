/******************************************************************************\
|                                                                              |
|                                   projects-view.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This is a view for showing a list of user projects.                   |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/projects/projects.tpl',
	'scripts/registry',
	'scripts/models/permissions/user-permission',
	'scripts/collections/projects/projects',
	'scripts/views/dialogs/error-view',
	'scripts/views/projects/list/projects-list-view',
	'scripts/views/users/dialogs/project-ownership/project-ownership-policy-view',
	'scripts/views/users/dialogs/project-ownership/project-ownership-status-view'
], function($, _, Backbone, Marionette, Template, Registry, UserPermission, Projects, ErrorView, ProjectsListView, ProjectOwnershipPolicyView, ProjectOwnershipStatusView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//
		
		template: _.template(Template),

		regions: {
			ownedProjectsList: '#owned-projects-list',
			joinedProjectsList: '#joined-projects-list'
		},

		events: {
			'click #add-new-project': 'onClickAddNewProject',
			'click #show-numbering': 'onClickShowNumbering'
		},

		//
		// methods
		//

		initialize: function() {
			this.collection = new Projects();
		},

		addProject: function() {
			var self = this;

			// fetch user in case user permissions have changed
			//
			Registry.application.session.user.fetch({

				// callbacks
				//
				success: function() {

					// check to see if user has project owner permissions
					//
					if (Registry.application.session.user.isOwner()) {
						Backbone.history.navigate('#projects/add', {
							trigger: true
						});
					} else {

						// fetch user permissions
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

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch user."
						})
					);
				}
			});
		},

		//
		// ajax methods
		//

		fetchProjects: function(done) {
			this.collection.fetch({

				// callbacks
				//
				success: function() {
					done();
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch list of projects."
						})
					);
				}
			})
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				showNumbering: Registry.application.getShowNumbering()
			}));
		},

		onRender: function() {
			var self = this;

			// fetch and show projects
			//
			this.fetchProjects(function() {
				self.showProjectsList();
			});
		},

		showProjectsList: function() {

			// show list of owned projects
			//
			this.ownedProjectsList.show(
				new ProjectsListView({
					collection: this.collection.getNonTrialProjects().getProjectsOwnedBy(Registry.application.session.user),
					showNumbering: Registry.application.getShowNumbering(),
					showDelete: true
				})
			);

			// show list of joined projects
			//
			this.joinedProjectsList.show(
				new ProjectsListView({
					collection: this.collection.getNonTrialProjects().getProjectsNotOwnedBy(Registry.application.session.user),
					showNumbering: Registry.application.getShowNumbering(),
					showDelete: true
				})
			);
		},

		//
		// event handling methods
		//

		onClickAddNewProject: function() {
			this.addProject();
		},

		onClickShowNumbering: function(event) {
			Registry.application.setShowNumbering($(event.target).is(':checked'));
			this.showProjectsList();
		}
	});
});
