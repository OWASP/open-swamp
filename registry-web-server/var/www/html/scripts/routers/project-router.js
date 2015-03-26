/******************************************************************************\
|                                                                              |
|                                 project-router.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the url routing that's used for project routes.          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone'
], function($, _, Backbone) {

	function parseQueryString(queryString) {

		// parse query string
		//
		var data = queryStringToData(queryString);

		// parse limit
		//
		if (data['limit']) {
			if (data['limit'] != 'none') {
				data['limit'] = parseInt(data['limit']);
			} else {
				data['limit'] = null;
			}
		}

		return data;
	}

	// create router
	//
	return Backbone.Router.extend({

		//
		// route definitions
		//

		routes: {

			// project viewing and creation routes
			//
			'projects': 'showMyProjects',
			'projects/add': 'showAddNewProject',

			// project administration routes
			//
			'projects/review(?*query_string)': 'showReviewProjects',

			// project routes
			//
			'projects/:project_uid': 'showProject',
			'projects/:project_uid/edit': 'showEditProject',

			// project member routes
			//
			'projects/:project_uid/members/invite': 'showInviteProjectMembers',
			'projects/:project_uid/members/invite/confirm/:key': 'showConfirmProjectInvitation'
		},

		//
		// project viewing and creation route handlers
		//

		showMyProjects: function() {
			require([
				'scripts/registry',
				'scripts/views/projects/projects-view'
			], function (Registry, ProjectsView) {

				// show content view
				//
				Registry.application.showContent({
					nav1: 'home',
					nav2: 'projects', 

					// callbacks
					//
					done: function(view) {

						// show projects view
						//
						view.content.show(
							new ProjectsView()
						);
					}
				});
			});
		},

		showAddNewProject: function() {
			require([
				'scripts/registry',
				'scripts/views/projects/add/add-new-project-view'
			], function (Registry, AddNewProjectView) {

				// show content view
				//
				Registry.application.showContent({
					'nav1': 'home',
					'nav2': 'projects', 

					// callbacks
					//
					done: function(view) {

						// show add new project view
						//
						view.content.show(
							new AddNewProjectView({
								user: Registry.application.session.user
							})
						);
					}
				});
			});
		},

		//
		// project administration route handlers
		//

		showReviewProjects: function(queryString) {
			require([
				'scripts/registry',
				'scripts/utilities/query-strings',
				'scripts/utilities/url-strings',
				'scripts/views/projects/review/review-projects-view',
			], function (Registry, QueryStrings, UrlStrings, ReviewProjectsView) {

				// show content view
				//
				Registry.application.showContent({
					'nav1': 'home',
					'nav2': 'overview', 

					// callbacks
					//
					done: function(view) {

						// show review projects view
						//
						view.content.show(
							new ReviewProjectsView({
								data: parseQueryString(queryString)
							})
						);
					}
				});
			});
		},

		//
		// project route handlers
		//

		showProjectView: function(projectUid, options) {
			require([
				'scripts/registry',
				'scripts/models/projects/project',
				'scripts/views/dialogs/error-view'
			], function (Registry, Project, ErrorView) {

				// fetch project
				//
				var project = new Project({
					project_uid: projectUid
				});

				project.fetch({

					// callbacks
					//
					success: function() {

						// show content view
						//
						Registry.application.showContent({
							nav1: 'home',
							nav2: options.nav,

							// callbacks
							//
							done: function(view) {
								view.content.model = project;
								if (options.done) {
									options.done(view.content);
								}
							}
						});
					},

					error: function() {

						// show error dialog
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "Could not fetch project."
							})
						);
					}
				});
			});
		},

		showProject: function(projectUid, options) {
			var self = this;
			require([
				'scripts/config',
				'scripts/registry',
				'scripts/models/projects/project',
				'scripts/models/projects/project-membership',
				'scripts/views/dialogs/error-view',
				'scripts/views/projects/info/project-view'
			], function (Config, Registry, Project, ProjectMembership, ErrorView, ProjectView) {

				// show project view
				//
				self.showProjectView(projectUid, {
					nav: 'projects', 

					// callbacks
					//
					done: function(view) {

						// fetch project membership
						//
						var projectMembership = new ProjectMembership();
						var user = Registry.application.session.user;

						// fetch user's project membership
						//
						projectMembership.fetch({
							url: Config.registryServer + '/memberships/projects/' + view.model.get('project_uid') + '/users/' + user.get('user_uid'),

							// callbacks
							//
							success: function() {

								// show project view for members
								//
								view.show(
									new ProjectView({
										model: view.model,
										projectMembership: projectMembership
									})
								);
							},

							error: function() {

								// show project view for non-members
								//
								view.show(
									new ProjectView({
										model: view.model
									})
								);
							}
						});
					}
				});
			});
		},

		showEditProject: function(projectUid) {
			var self = this;
			require([
				'scripts/views/projects/info/edit-project-view'
			], function (EditProjectView) {

				// show project view
				//
				self.showProjectView(projectUid, {
					nav: 'projects', 

					// callbacks
					//
					done: function(view) {

						// show edit project view
						//
						view.show(
							new EditProjectView({
								model: view.model
							})
						);
					}
				});
			});
		},

		//
		// project project invitation route handlers
		//

		showInviteProjectMembers: function(projectUid) {
			var self = this;
			require([
				'scripts/views/projects/info/members/invitations/invite-project-members-view'
			], function (InviteProjectMembersView) {

				// show project view
				//
				self.showProjectView(projectUid, {
					nav: 'projects',

					// callbacks
					//
					done: function(view) {

						// show invite project members view
						//
						view.show(
							new InviteProjectMembersView({
								model: view.model
							})
						);
					}
				});
			});
		},

		showConfirmProjectInvitation: function(projectUid, invitationKey) {
			require([
				'scripts/registry',
				'scripts/models/projects/project-invitation',
				'scripts/views/projects/info/members/invitations/confirm-project-invitation-view',
				'scripts/views/projects/info/members/invitations/please-register-view',
				'scripts/views/projects/info/members/invitations/invalid-project-invitation-view'
			], function (Registry, ProjectInvitation, ConfirmProjectInvitationView, PleaseRegisterView, InvalidProjectInvitationView) {

				// fetch project invitation
				//
				var projectInvitation = new ProjectInvitation({
					'project_uid': projectUid,
					'invitation_key': invitationKey
				});

				projectInvitation.confirm({

					// callbacks
					//
					success: function(sender, project) {
						projectInvitation.confirmInvitee({

							// callbacks
							//
							success: function(invitee) {

								// show confirm project invitation view
								//
								Registry.application.showMain(
									new ConfirmProjectInvitationView({
										model: projectInvitation,
										sender: sender,
										project: project,
										user: invitee
									})
								);
							},

							error: function() {

								// show please register view
								//
								Registry.application.showMain(
									new PleaseRegisterView({
										model: projectInvitation,
										sender: sender,
										project: project
									})
								);
							}
						});
					},

					error: function(message) {

						// show invalid project invitation view
						//
						Registry.application.show(
							new InvalidProjectInvitationView({
								message: message
							})
						);	
					}
				});
			});
		}
	});
});


