/******************************************************************************\
|                                                                              |
|                                run-requests-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a project's current list of.        |
|        run requests.                                                         |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/run-requests/run-requests.tpl',
	'scripts/registry',
	'scripts/widgets/accordions',
	'scripts/models/projects/project',
	'scripts/collections/assessments/assessment-runs',
	'scripts/collections/assessments/execution-records',
	'scripts/views/dialogs/error-view',
	'scripts/views/scheduled-runs/filters/run-requests-filters-view',
	'scripts/views/scheduled-runs/run-requests-list/run-requests-list-view'
], function($, _, Backbone, Marionette, Template, Registry, Accordions, Project, AssessmentRuns, ExecutionRecords, ErrorView, RunRequestsFiltersView, RunRequestsListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			runRequestsFilters: '#run-requests-filters',
			runRequestsList: '#run-requests-list'
		},

		events: {
			'click #view-assessments': 'onClickViewAssessments',
			'click #view-results': 'onClickViewResults',
			'click #add-new-scheduled-runs': 'onClickAddNewScheduledRuns',
			'click #show-numbering': 'onClickShowNumbering',
			'click #show-schedules': 'onClickShowSchedules'
		},

		//
		// methods
		//

		initialize: function() {
			this.collection = new AssessmentRuns();
		},

		//
		// querying methods
		//

		getQueryString: function() {
			return this.runRequestsFilters.currentView.getQueryString();
		},

		getFilterData: function(attributes) {
			return this.scheduledRunsFilters.currentView.getData(attributes);
		},

		//
		// ajax methods
		//

		fetchAssessmentRuns: function(done) {
			if (this.options.data['project']) {

				// fetch collection of assessment runs for a project
				//
				this.collection.fetchByProject(this.options.data['project'], {

					// attributes
					//
					data: this.getFilterData(['package', 'tool', 'platform', 'limit']),

					// callbacks
					//
					success: function() {
						done(this.collection);
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
			} else if (this.options.data['projects'] && this.options.data['projects'].length > 0) {

				// fetch collection of assessment runs for all projects
				//
				this.collection.fetchByProjects(this.options.data['projects'], {

					// attributes
					//
					data: this.getFilterData(['package', 'tool', 'platform', 'limit']);

					// callbacks
					//
					success: function() {
						done(this.collection);
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
			}
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				project: this.options.data['project'],
				package: this.options.data['package'],
				packageVersion: this.options.data['package-version'],
				tool: this.options.data['tool'],
				toolVersion: this.options.data['tool-version'],
				platform: this.options.data['platform'],
				platformVersion: this.options.data['platform-version'],
				showNavigation: Object.keys(this.options.data).length > 0,
				showNumbering: Registry.application.getShowNumbering()
			}));
		},

		onRender: function() {
			var self = this;

			// change accordion icon
			//
			new Accordions(this.$el.find('.accordion'));
			
			// show run requests filters view
			//
			this.runRequestsFilters.show(
				new RunRequestsFiltersView({
					model: this.model,
					data: this.options.data,

					// callbacks
					//
					onChange: function() {
						setQueryString(self.getQueryString());	
					}
				})
			);

			// fetch and show run requests
			//
			this.fetchAssessmentRuns(function(collection) {
				self.showRunRequestsList();
			});

			// add count bubbles / badges
			//
			this.addBadges();
		},

		showRunRequestsList: function() {
			this.runRequestsList.show(
				new RunRequestsListView({
					collection: this.collection,
					showDelete: true
				})
			);
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
			if (this.options.data['project']) {
				AssessmentRuns.fetchNumByProject(this.options.data['project'], {
					data: this.getFilterData(['package', 'tool', 'platform']),

					success: function(number) {
						self.addBadge("#view-assessments", number);
					}
				});
			} else if (this.options.data['projects'] && this.options.data['projects'].length > 0) {
				AssessmentRuns.fetchNumByProjects(this.options.data['projects'], {
					data: this.getFilterData(['package', 'tool', 'platform']),

					success: function(number) {
						self.addBadge("#view-assessments", number);
					}
				});
			} else {
				this.addBadge("#view-assessments", 0);
			}

			// add num results badge
			//
			if (this.options.data['project']) {
				ExecutionRecords.fetchNumByProject(this.options.data['project'], {
					data: this.getFilterData(['package', 'tool', 'platform']),

					success: function(number) {
						self.addBadge("#view-results", number);
					}
				});
			} else if (this.options.data['projects'] && this.options.data['projects'].length > 0) {
				ExecutionRecords.fetchNumByProjects(this.options.data['projects'], {
					data: this.getFilterData(['package', 'tool', 'platform']),

					success: function(number) {
						self.addBadge("#view-results", number);
					}
				});
			} else {
				this.addBadge("#view-results", 0);
			}
		},

		//
		// event handling methods
		//

		onClickViewAssessments: function() {
			var queryString = this.getQueryString();

			// go to assessments view
			//
			Backbone.history.navigate('#assessments' + (queryString != ''? '?' + queryString : ''), {
				trigger: true
			});
		},

		onClickViewResults: function() {
			var queryString = this.getQueryString();
			
			// go to assessment results view
			//
			Backbone.history.navigate('#results' + (queryString != ''? '?' + queryString : ''), {
				trigger: true
			});
		},

		onClickAddNewScheduledRuns: function() {
			var queryString = this.getQueryString();
			
			// go to my assessments view
			//
			Backbone.history.navigate('#assessments' + (queryString != ''? '?' + queryString : ''), {
				trigger: true
			});
		},

		onClickShowNumbering: function(event) {
			Registry.application.setShowNumbering($(event.target).is(':checked'));
			this.showRunRequestsList();
		},

		onClickShowSchedules: function() {
			var queryString = this.getQueryString();

			// go to my schedules view
			//
			Backbone.history.navigate('#run-requests/schedules' + (queryString != ''? '?' + queryString : ''), {
				trigger: true
			});		
		}
	});
});