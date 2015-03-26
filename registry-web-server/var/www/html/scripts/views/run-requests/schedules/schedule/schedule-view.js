/******************************************************************************\
|                                                                              |
|                                 schedule-view.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for viewing a run request schedule.             |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/run-requests/schedules/schedule/schedule.tpl',
	'scripts/registry',
	'scripts/collections/run-requests/run-request-schedules',
	'scripts/views/dialogs/error-view',
	'scripts/views/scheduled-runs/schedules/profile/schedule-profile-view',
	'scripts/views/scheduled-runs/schedules/schedule/run-request-schedules-list/run-request-schedules-list-view'
], function($, _, Backbone, Marionette, Template, Registry, RunRequestSchedules, ErrorView, ScheduleProfileView, RunRequestSchedulesListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			scheduleProfile: '#schedule-profile',
			scheduleItemsList: '#schedule-items-list'
		},

		events: {
			'click #ok': 'onClickOk',
			'click #edit': 'onClickEdit'
		},

		//
		// methods
		//

		initialize: function() {
			this.collection = new RunRequestSchedules();
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
			
			this.scheduleProfile.show(
				new ScheduleProfileView({
					model: this.model
				})
			);

			// get schedule items
			//
			this.collection.fetchByRunRequest(this.model, {

				// callbacks
				//
				success: function() {

					// show schedule items list
					//
					self.scheduleItemsList.show(
						new RunRequestSchedulesListView({
							collection: self.collection
						})
					);

					// enable or disable save button
					//
					if (self.collection.length === 0) {
						self.disableSaveButton();
					}
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch items for this schedule."
						})
					);
				}
			});
		},

		//
		// event handling methods
		//

		onClickOk: function() {

			// go to run requests view
			//
			Backbone.history.navigate('#run-requests' + (!this.options.project.isTrialProject()? '?project=' + this.options.project.get('project_uid') : ''), {
				trigger: true
			});
		},

		onClickEdit: function() {

			// go to edit schedules view
			//
			Backbone.history.navigate('#run-requests/schedules/' + this.model.get('run_request_uuid') + '/edit', {
				trigger: true
			});
		}
	});
});