/******************************************************************************\
|                                                                              |
|                             project-members-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a project's membership.             |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/projects/info/members/project-members.tpl',
	'scripts/config',
	'scripts/registry',
	'scripts/models/projects/project-membership',
	'scripts/collections/users/users',
	'scripts/collections/projects/project-memberships',
	'scripts/views/dialogs/error-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/projects/info/members/list/project-members-list-view'
], function($, _, Backbone, Marionette, Template, Config, Registry, ProjectMembership, Users, ProjectMemberships, ErrorView, NotifyView, ProjectMembersListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			membersList: '#members-list'
		},

		events: {
			'click input':   'onClickCheck',
			'click #invite': 'onClickInvite',
			'click #submit:not(.disabled)': 'onClickSubmit',
			'click #submit.disabled': 'onClickSubmitDisabled'
		},

		//
		// methods
		//

		initialize: function() {
			this.collection = new ProjectMemberships();
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

		//
		// rendering methods
		//

		template: function(data) {
			var isOwned = this.model.isOwned();
			var isAdmin = Registry.application.session.isAdmin() ||
				this.options.projectMembership && this.options.projectMembership.isAdmin();
			return _.template(Template, _.extend(data, {
				isAdmin: isOwned || isAdmin,
				isTrialProject: this.model.isTrialProject()
			}));
		},

		onRender: function() {
			var self = this;

			this.disableSaveButton();

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

		//
		// event handling methods
		//

		onClickCheck: function() {
			var changed = this.collection.any(function(item) { return item.hasChanged(); });
			if(changed) {
				this.enableSaveButton();
			}
			else {
				this.disableSaveButton();
			}
		},

		onClickInvite: function() {
			Backbone.history.navigate('#projects/' + this.model.get('project_uid') + '/members/invite', {
				trigger: true
			});
		},

		onClickSubmit: function() {
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

		enableSaveButton: function() {
			this.$el.find('#submit').removeClass('disabled');
		},

		disableSaveButton: function() {
			this.$el.find('#submit').addClass('disabled');
		}
	});
});
