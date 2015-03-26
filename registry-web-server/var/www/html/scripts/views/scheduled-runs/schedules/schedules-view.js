/******************************************************************************\
|                                                                              |
|                                   schedules-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for editing run request schedules.              |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/scheduled-runs/schedules/schedules.tpl',
	'scripts/registry',
	'scripts/collections/run-requests/run-requests',
	'scripts/views/dialogs/error-view',
	'scripts/views/scheduled-runs/schedules/filters/schedule-filters-view',
	'scripts/views/scheduled-runs/schedules/list/schedules-list-view'
], function($, _, Backbone, Marionette, Template, Registry, RunRequests, ErrorView, ScheduleFiltersView, SchedulesListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			scheduleFilters: '#schedule-filters',
			schedulesList: '#schedules-list'
		},

		events: {
			'click #add-new-schedule': 'onClickAddNewSchedule',
			'click #show-numbering': 'onClickShowNumbering',
			'click #cancel': 'onClickCancel',
		},

		//
		// methods
		//

		initialize: function() {
			this.collection = new RunRequests();

			// parse list of assessment run uuids
			//
			if (this.options.selectedAssessmentRunUuids) {
				this.selectedAssessmentRunUuids = this.options.selectedAssessmentRunUuids.split('+');
			}
		},

		//
		// ajax methods
		//

		fetchSchedules: function(done) {
			var self = this;
			
			if (this.options.data['project']) {

				// fetch collection of schedules for a project
				//
				this.collection.fetchByProject(this.options.data['project'], {
					data: this.scheduleFilters.currentView.getData(),

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
								message: "Could not get run requests for this project."
							})
						);
					}
				});
			} else if (this.options.data['projects']) {

				// fetch collection of schedules for all projects
				//
				this.collection.fetchByProjects(this.options.data['projects'], {
					data: this.scheduleFilters.currentView.getData(),

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
								message: "Could not get run requests for all projects."
							})
						);
					}
				});
			} else {

				// no project
				//
				done();
			}
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				project: this.options.data['project'],
				showNumbering: Registry.application.getShowNumbering()
			}));
		},

		onRender: function() {
			var self = this;

			// show schedule filters view
			//
			this.scheduleFilters.show(
				new ScheduleFiltersView({
					model: this.model,
					data: this.options.data? this.options.data : {},

					// callbacks
					//
					onChange: function() {
						setQueryString(self.scheduleFilters.currentView.getQueryString());			
					}
				})
			);

			// fetch and show schedules
			//
			this.fetchSchedules(function() {
				self.showSchedulesList();
			});
		},

		showSchedulesList: function() {

			// show schedules list view
			//
			this.schedulesList.show(
				new SchedulesListView({
					project: this.options.data['project'],
					collection: this.collection,
					selectedAssessmentRunUuids: this.options.selectedAssessmentRunUuids,
					showNumbering: Registry.application.getShowNumbering(),
					showDelete: true
				})
			);
		},

		//
		// event handling methods
		//

		onClickAddNewSchedule: function() {
			var queryString = this.scheduleFilters.currentView.getQueryString();
			
			// go to add schedule view
			//
			Backbone.history.navigate('#run-requests/schedules/add' + (queryString != ''? '?' + queryString : ''), {
				trigger: true
			});
		},

		onClickShowNumbering: function(event) {
			Registry.application.setShowNumbering($(event.target).is(':checked'));
			this.showSchedulesList();
		},

		onClickCancel: function() {
			var queryString = this.scheduleFilters.currentView.getQueryString();

			// return to run requests view
			//
			Backbone.history.navigate('#run-requests' + (queryString != ''? '?' + queryString : ''), {
				trigger: true
			});
		}
	});
});