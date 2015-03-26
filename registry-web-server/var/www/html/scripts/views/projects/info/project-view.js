/******************************************************************************\
|                                                                              |
|                                  project-view.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a project's profile info.           |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/projects/info/project.tpl',
	'scripts/config',
	'scripts/registry',
	'scripts/collections/users/users',
	'scripts/collections/projects/project-memberships',
	'scripts/collections/assessments/assessment-runs',
	'scripts/collections/assessments/execution-records',
	'scripts/collections/assessments/scheduled-runs',
	'scripts/collections/run-requests/run-requests',
	'scripts/collections/events/project-events',
	'scripts/collections/events/user-project-events',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/projects/info/project-profile/project-profile-view',
	'scripts/views/projects/info/members/list/project-members-list-view'
], function($, _, Backbone, Marionette, Template, Config, Registry, Users, ProjectMemberships, AssessmentRuns, ExecutionRecords, ScheduledRuns, RunRequests, ProjectEvents, UserProjectEvents, ConfirmView, NotifyView, ErrorView, ProjectProfileView, ProjectMembersListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			projectProfile: '#project-profile',
			membersList: '#members-list'
		},

		events: {
			'click #assessments': 'onClickAssessments',
			'click #results': 'onClickResults',
			'click #runs': 'onClickRuns',
			'click #schedules': 'onClickSchedules',
			'click #events': 'onClickEvents',
			'click #invite': 'onClickInvite',
			'click input': 'onClickCheck',
			'click #run-new-assessment': 'onClickRunNewAssessment',
			'click #edit-project': 'onClickEditProject',
			'click #delete-project': 'onClickDeleteProject',
			'click #save-changes:not(.disabled)': 'onClickSaveChanges',
			'click #save-changes.disabled': 'onClickSaveChangesDisabled',
			'click #cancel': 'onClickCancel'
		},

		//
		// methods
		//

		initialize: function() {
			this.collection = new ProjectMemberships();
		},

		enableSaveChangesButton: function() {
			this.$el.find('#save-changes').removeClass('disabled');
		},

		disableSaveChangesButton: function() {
			this.$el.find('#save-changes').addClass('disabled');
		},

		saveProjectMemberships: function() {
			var self = this;

			// save project memberships individually
			//
			var successes = 0, errors = 0, changes = 0;
			for (var i = 0; i < this.collection.length; i++) {
				var model = this.collection.at(i);

				if (model.hasChanged()) {
					changes++;
					model.save(undefined, {
						url: Config.registryServer + '/memberships/' + model.get('membership_uid'),

						// callbacks
						//
						success: function() {
							successes++;

							// report success when completed
							//
							if (i === self.collection.length && successes === changes) {

								// show success notify view
								//
								Registry.application.modal.show(
									new NotifyView({
										title: "Project Memberships Changed",
										message: "Your project membership changes have been saved.",

										// callbacks
										//
										accept: function() {
											self.render();
										}
									})
								);
							}
						},

						error: function() {
							errors++;

							// report first error
							//
							if (errors === 1) {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Your project membership changes could not be saved."
									})
								);
							}
						}
					});
				}
			}
			if (changes === 0) {

				// show no changes notification view
				//
				Registry.application.modal.show(
					new NotifyView({
						message: "There are no new project membership changes to save."
					})
				);
			}

			// save project memberships
			//
			/*
			this.collection.save({

				// callbacks
				//
				success: function() {

					// go to projects updated confirmation view
					//
					Backbone.history.navigate('#projects/' + self.model.get('project_uid') + '/members/updated', {
						trigger: true
					});
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not save project memberships."
						})
					);
				}
			});
			*/
		},

		deleteProject: function() {
			this.model.destroy({

				// callbacks
				//
				success: function() {

					// return to projects view
					//
					Backbone.history.navigate('#projects', {
						trigger: true
					});
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not delete this project."
						})
					);
				}
			});
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model,
				isOwned: this.model.isOwned(),
				isTrialProject: this.model.isTrialProject(),
				isAdmin: Registry.application.session.isAdmin(),
				isProjectAdmin: Registry.application.session.isAdmin() ||
					this.options.projectMembership && this.options.projectMembership.isAdmin()
			}));
		},

		onRender: function() {

			// display project profile view
			//
			this.projectProfile.show(
				new ProjectProfileView({
					model: this.model
				})
			);

			// show project members view
			//
			this.showProjectMembers();

			// and add count bubbles / badges for project info
			//
			this.addBadges();
		},

		showProjectMembers: function() {
			var self = this;
			this.disableSaveChangesButton();

			// get list of project's user memberships
			//
			this.collection.fetchByProject(this.model, {

				// callbacks
				//
				success: function() {

					// get the list of members
					//
					var users = new Users();
					users.fetchByProject(self.model, {

						// callbacks
						//
						success: function() {
							self.membersList.show(
								new ProjectMembersListView({
									model: self.model,
									collection: users,
									currentProjectMembership: self.options.projectMembership,
									projectMemberships: self.collection,
									showDelete: true
								})
							);

							// show count of project members
							//
							self.showNumberOfMembers(self.collection.length);
						},

						error: function() {

							// show error dialog
							//
							Registry.application.modal.show(
								new ErrorView({
									message: "Could not fetch project users."
								})
							);
						}
					});
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch project memberships."
						})
					);
				}
			});
		},

		showNumberOfMembers: function(numberOfMembers) {
			this.$el.find('#number-of-members').html(numberOfMembers);
		},

		addBadge: function(selector, num) {
			if (num > 0) {
				this.$el.find(selector).append('<span class="badge">' + num + '</span>');
			} else {
				this.$el.find(selector).append('<span class="badge badge-important">' + num + '</span>');
			}
		},

		addBadges: function() {
			var self = this;

			// add num assessments badge
			//
			AssessmentRuns.fetchNumByProject(this.model, {
				success: function(number) {
					self.addBadge("#assessments", number);
				}
			});

			// add num results badge
			//
			ExecutionRecords.fetchNumByProject(this.model, {
				success: function(number) {
					self.addBadge("#results", number);
				}
			});

			// add num scheduled runs badge
			//
			ScheduledRuns.fetchNumByProject(this.model, {
				success: function(number) {
					self.addBadge("#runs", number);
				}
			});

			// add num schedules badge
			//
			RunRequests.fetchNumSchedulesByProject(this.model, {
				success: function(number) {
					self.addBadge("#schedules", number);
				}
			});

			// add num events badge
			//
			ProjectEvents.fetchNumByUser(this.model, Registry.application.session.user, {
				success: function(numProjectEvents) {
					UserProjectEvents.fetchNumByUser(self.model, Registry.application.session.user, {
						success: function(numUserProjectEvents) {
							self.addBadge("#events", numProjectEvents + numUserProjectEvents);
						}
					});
				}
			});
		},

		//
		// event handling methods
		//

		onClickAssessments: function() {

			// go to assessments view
			//
			Backbone.history.navigate('#assessments?project=' + this.model.get('project_uid'), {
				trigger: true
			});
		},

		onClickResults: function() {

			// go to assessment results view
			//
			Backbone.history.navigate('#results?project=' + this.model.get('project_uid'), {
				trigger: true
			});
		},

		onClickRuns: function() {

			// go to run requests view
			//
			Backbone.history.navigate('#run-requests?project=' + this.model.get('project_uid'), {
				trigger: true
			});
		},

		onClickSchedules: function() {

			// go to run request schedules view
			//
			Backbone.history.navigate('#run-requests/schedules?project=' + this.model.get('project_uid'), {
				trigger: true
			});
		},

		onClickEvents: function() {

			// go to events view
			//
			Backbone.history.navigate('#events?type=project&project=' + this.model.get('project_uid'), {
				trigger: true
			});
		},

		onClickInvite: function() {

			// go to invite members view
			//
			Backbone.history.navigate('#projects/' + this.model.get('project_uid') + '/members/invite', {
				trigger: true
			});
		},

		onClickCheck: function() {
			var changed = this.collection.any(function(item) {
				return item.hasChanged();
			});

			// enable / disable save changes button
			//
			if (changed) {
				this.enableSaveChangesButton();
			} else {
				this.disableSaveChangesButton();
			}
		},

		onClickRunNewAssessment: function() {

			// go to run new assessment view
			//
			Backbone.history.navigate('#assessments/run?project=' + this.model.get('project_uid'), {
				trigger: true
			});
		},

		onClickEditProject: function() {

			// go to edit project view
			//
			Backbone.history.navigate('#projects/' + this.model.get('project_uid') + '/edit', {
				trigger: true
			});
		},

		onClickDeleteProject: function() {
			var self = this;

			// show confirm dialog
			//
			Registry.application.modal.show(
				new ConfirmView({
					title: "Delete Project",
					message: "Are you sure that you would like to delete project " + self.model.get('full_name') + "? " +
						"When you delete a project, all of the project data will continue to be retained.",

					// callbacks
					//
					accept: function() {
						self.deleteProject();
					}
				})
			);
		},

		onClickSaveChanges: function() {
			this.saveProjectMemberships();
		},

		onClickSubmitDisabled: function() {

			// show no changes notification view
			//
			Registry.application.modal.show(
				new NotifyView({
					message: "No changes made to project members to save."
				})
			);
		},

		onClickCancel: function() {
			Backbone.history.navigate('#projects', {
				trigger: true
			});			
		}
	});
});
