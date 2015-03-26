/******************************************************************************\
|                                                                              |
|                           invite-project-members-view.js                     |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for inviting new project members.               |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/projects/info/members/invitations/invite-project-members.tpl',
	'scripts/registry',
	'scripts/models/projects/project-invitation',
	'scripts/collections/projects/project-invitations',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/projects/info/members/invitations/project-invitations-list/project-invitations-list-view',
	'scripts/views/projects/info/members/invitations/new-project-invitations-list/new-project-invitations-list-view',
], function($, _, Backbone, Marionette, Template, Registry, ProjectInvitation, ProjectInvitations, NotifyView, ErrorView, ProjectInvitationsListView, NewProjectInvitationsListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			projectInvitationsList: '#project-invitations-list',
			newProjectInvitationsList: '#new-project-invitations-list'
		},

		events: {
			'click #add': 'onClickAdd',
			'click #send.disabled': 'onClickSendDisabled',
			'click #send:not(.disabled)': 'onClickSend',
			'click #cancel': 'onClickCancel'
		},

		//
		// methods
		//

		initialize: function() {
			var self = this;

			// create collection of invitations
			//
			this.collection = new ProjectInvitations([]);

			this.collection.bind('remove', function() {
				if (self.collection.length === 0) {
					self.disableSaveButton();
				}
			}, this);

			this.collection.bind('add', function() {
				self.enableSaveButton();
			}, this);
		},

		send: function() {
			var self = this;

			// check form validation
			//
			if (this.newProjectInvitationsList.currentView.isValid()) {
				if (this.collection.length > 0) {

					// duplicate list so we can remove them while iterating the original
					//
					var invitations = _.clone(this.collection);

					// save project invitations individually
					//
					var successes = 0, errors = 0;
					for (var i = 0; i < invitations.length; i++) {
						invitations.at(i).save(undefined, {

							// callbacks
							//
							success: function(model, response, options) {
								successes++;

								self.collection.remove(model);
								self.render();

								// report success when completed, clear list if all complete
								//
								if (successes === invitations.length) {
									self.collection.reset();
								}
								if (successes === 1) {

									// show success notification dialog
									//
									Registry.application.modal.show(
										new NotifyView({
											title: "Project Invitations Sent",
											message: "Your invitations to project " + self.model.get('full_name') + " have been successfully sent to all recipients.",

											// callbacks
											//
											accept: function() {

												// update view
												//
												self.render();
											}
										})
									);
								}
							},

							error: function(model, response) {
								var message = "Could not send project invitations";
								if (response.responseText != "") {
									var error_messages = JSON.parse(response.responseText);
									if (error_messages.length > 0) {
										message += " because " + error_messages.join();
									} else if (typeof error_messages == 'object') {
										message += " because " + error_messages.error.message;
									}
								}
								errors++;

								// report first error
								//
								if (errors === 1) {

									// show error dialog
									//
									Registry.application.modal.show(
										new ErrorView({
											message: message
										})
									);
								}
							}
						});
					}
				}
			}
		},

		//
		// ajax methods
		//

		fetchProjectInvitations: function(done) {
			var self = this;
			var collection = new ProjectInvitations([]);

			// fetch project invitations
			//
			collection.fetchByProject(this.model, {

				// callbacks
				//
				success: function() {
					done(collection);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch project invitations."
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
				model: this.model
			}));
		},

		onRender: function() {

			// show old and new project invitations
			//
			this.showProjectInvitations();
			this.showNewProjectInvitations();

			if (this.collection.length === 0) {
				this.disableSaveButton();
			}
		},

		enableSaveButton: function() {
			this.$el.find('#send').removeClass('disabled');
		},

		disableSaveButton: function() {
			this.$el.find('#send').addClass('disabled');
		},

		showProjectInvitations: function() {
			var self = this;

			// fetch and show project invitations
			//
			this.fetchProjectInvitations(function(collection) {
				self.projectInvitationsList.show(
					new ProjectInvitationsListView({
						model: self.model,
						collection: collection,
						showDelete: true
					})
				);
			});
		},

		showNewProjectInvitations: function() {
			this.newProjectInvitationsList.show(
				new NewProjectInvitationsListView({
					model: this.model,
					collection: this.collection,
					showDelete: true
				})
			);
		},

		//
		// event handling methods
		//

		onClickAdd: function() {
			var user = Registry.application.session.user;

			// add new project invitation
			//
			this.collection.add(new ProjectInvitation({
				'project_uid': this.model.get('project_uid'),
				'inviter_uid': user.get('user_uid'),
				'status': 'pending',
				'confirm_route': '#projects/' + this.model.get('project_uid') +'/members/invite/confirm',
				'register_route': '#register'
			}));

			// update view
			//
			this.newProjectInvitationsList.currentView.render();
		},

		onClickSend: function() {
			this.send();
		},

		onClickSendDisabled: function() {

			// show no invitatoins dialog
			//
			Registry.application.modal.show(
				new NotifyView({
					message: "There are no project invitations to send."
				})
			);
		},

		onClickCancel: function() {

			// go to project view
			//
			Backbone.history.navigate('#projects/' + this.model.get('project_uid'), {
				trigger: true
			});
		}
	});
});
