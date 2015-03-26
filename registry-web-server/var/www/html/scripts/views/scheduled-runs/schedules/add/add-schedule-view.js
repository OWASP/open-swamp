/******************************************************************************\
|                                                                              |
|                                add-schedule-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for creating a new run request schedule.        |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/run-requests/schedules/add/add-schedule.tpl',
	'scripts/registry',
	'scripts/models/run-requests/run-request',
	'scripts/models/run-requests/run-request-schedule',
	'scripts/collections/run-requests/run-requests',
	'scripts/collections/run-requests/run-request-schedules',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/scheduled-runs/schedules/profile/schedule-profile-form-view',
	'scripts/views/scheduled-runs/schedules/edit/editable-run-request-schedules-list/editable-run-request-schedules-list-view'
], function($, _, Backbone, Marionette, Template, Registry, RunRequest, RunRequestSchedule, RunRequests, RunRequestSchedules, NotifyView, ErrorView, ScheduleProfileFormView, EditableRunRequestSchedulesListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			scheduleProfileForm: '#schedule-profile-form',
			scheduleItemsList: '#schedule-items-list'
		},

		events: {
			'click #add-request': 'onClickAddRequest',
			'click #save.disabled': 'onClickSaveDisabled',
			'click #save:not(.disabled)': 'onClickSave',
			'click #cancel': 'onClickCancel',
		},

		//
		// methods
		//

		initialize: function() {
			var self = this;

			this.model = new RunRequest({
				'project_uuid': this.options.project.get('project_uid')
			});
			this.collection = new RunRequestSchedules();

			// set item remove callback
			//
			this.collection.bind('remove', function() {
				if (self.collection.length === 0) {
					self.disableSaveButton();
				}
			}, this);
		},

		//
		// querying methods
		//

		getQueryString: function() {
			var queryString = '';

			if (this.options.project && !this.options.project.isTrialProject()) {
				queryString = addQueryString(queryString, 'project=' + this.options.project.get('project_uid'));
			}
			if (this.options.assessmentRunUuids) {
				queryString = addQueryString(queryString, 'assessments=' + this.options.assessmentRunUuids);
			}

			return queryString;
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				project: this.options.project
			}));
		},

		onRender: function() {
			var self = this;

			// fetch project's existing schedules
			//
			var runRequests = new RunRequests();
			runRequests.fetchByProject(this.options.project, {

				// callbacks
				//
				success: function() {

					// show schedule form
					//
					self.scheduleProfileForm.show(
						new ScheduleProfileFormView({
							model: self.model,
							collection: runRequests
						})
					);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch project's run requests."
						})
					);		
				}
			});	

			// show schedule items list
			//
			self.scheduleItemsList.show(
				new EditableRunRequestSchedulesListView({
					collection: this.collection,
					showDelete: true
				})
			);

			// disable save button
			//
			if (self.collection.length === 0) {
				self.disableSaveButton();
			}
		},

		enableSaveButton: function() {
			this.$el.find('#save').removeClass('disabled');
		},

		disableSaveButton: function() {
			this.$el.find('#save').addClass('disabled');
		},

		//
		// event handling methods
		//

		onClickAddRequest: function() {
			this.collection.add(
				new RunRequestSchedule({
					'recurrence_type': 'daily'
				})
			);

			// update view
			//
			this.enableSaveButton();
			this.scheduleItemsList.currentView.render();
		},

		onClickSaveDisabled: function() {

			// show notification dialog
			//
			Registry.application.modal.show(
				new NotifyView({
					message: "You must add one or more run requests before you can save a schedule."
				})
			);			
		},
		
		onClickSave: function() {
			var self = this;

			// check validation
			//
			if (this.scheduleProfileForm.currentView.isValid() && 
				this.scheduleItemsList.currentView.isValid()) {

				// update model from form
				//
				this.scheduleProfileForm.currentView.update(this.model);

				// save new schedule
				//
				this.model.save(undefined, {

					// callbacks
					//
					success: function() {

						// set run request uuid of each model in collection
						//
						for (var i = 0; i < self.collection.length; i++) {
							self.collection.at(i).set({
								'run_request_uuid': self.model.get('run_request_uuid')
							});
						}

						// save run request schedule items
						//
						self.collection.save({
							type: 'POST',
							
							// callbacks
							//
							success: function() {
								self.onClickCancel();
							},

							error: function() {

								// show error view
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Could not save schedule items."
									})
								);						
							}
						})
					},

					error: function() {

						// show error view
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "Could not save this run request schedule."
							})
						);
					}
				});
			}
		},

		onClickCancel: function() {
			var queryString = this.getQueryString();

			if (this.options.assessmentRunUuids) {

				// go to add run requests view
				//
				Backbone.history.navigate('#run-requests/add' + (queryString != ''? '?' + queryString : ''), {
					trigger: true
				});
			} else {

				// go to run request schedules view
				//
				Backbone.history.navigate('#run-requests/schedules' + (queryString != ''? '?' + queryString : ''), {
					trigger: true
				});
			}
		}
	});
});
