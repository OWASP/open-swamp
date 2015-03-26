/******************************************************************************\
|                                                                              |
|                              scheduled-runs-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a project's current list of.        |
|        scheduled assessment runs.                                            |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/scheduled-runs/scheduled-runs.tpl',
	'scripts/registry',
	'scripts/widgets/accordions',
	'scripts/models/projects/project',
	'scripts/collections/assessments/assessment-runs',
	'scripts/collections/assessments/execution-records',
	'scripts/collections/assessments/scheduled-runs',
	'scripts/views/dialogs/error-view',
	'scripts/views/scheduled-runs/filters/scheduled-runs-filters-view',
	'scripts/views/scheduled-runs/list/scheduled-runs-list-view'
], function($, _, Backbone, Marionette, Template, Registry, Accordions, Project, AssessmentRuns, ExecutionRecords, ScheduledRuns, ErrorView, ScheduledRunsFiltersView, ScheduledRunsListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			scheduledRunsFilters: '#scheduled-runs-filters',
			scheduledRunsList: '#scheduled-runs-list'
		},

		events: {
			'click #assessments': 'onClickAssessments',
			'click #results': 'onClickResults',
			'click #add-new-scheduled-runs': 'onClickAddNewScheduledRuns',
			'click #show-numbering': 'onClickShowNumbering',
			'click #show-schedules': 'onClickShowSchedules'
		},

		//
		// methods
		//

		initialize: function() {
			this.collection = new ScheduledRuns();
		},

		//
		// querying methods
		//

		getQueryString: function() {
			return this.scheduledRunsFilters.currentView.getQueryString();
		},

		getFilterData: function() {
			return this.scheduledRunsFilters.currentView.getData();
		},

		//
		// ajax methods
		//

		fetchScheduledRuns: function(done) {
			var self = this;
			if (this.options.data['project']) {

				// fetch collection of scheduled runs for a project
				//
				this.collection.fetchByProject(this.options.data['project'], {

					// attributes
					//
					data: this.getFilterData(['package', 'tool', 'platform', 'limit']),

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
								message: "Could not get scheduled runs for this project."
							})
						);
					}
				});
			} else if (this.options.data['projects'] && this.options.data['projects'].length > 0) {

				// fetch collection of scheduled runs for all projects
				//
				this.collection.fetchByProjects(this.options.data['projects'], {

					// attributes
					//
					data: this.getFilterData(['package', 'tool', 'platform', 'limit']),

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
								message: "Could not get scheduled runs for all projects."
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
			this.scheduledRunsFilters.show(
				new ScheduledRunsFiltersView({
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
			this.fetchScheduledRuns(function() {
				self.showScheduledRunsList();
			});

			// add count bubbles / badges
			//
			this.addBadges();
		},

		showScheduledRunsList: function() {
			this.scheduledRunsList.show(
				new ScheduledRunsListView({
					collection: this.collection,
					showNumbering: Registry.application.getShowNumbering(),
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
						self.addBadge("#assessments", number);
					}
				});
			} else if (this.options.data['projects'] && this.options.data['projects'].length > 0) {
				AssessmentRuns.fetchNumByProjects(this.options.data['projects'], {
					data: this.getFilterData(['package', 'tool', 'platform']),

					success: function(number) {
						self.addBadge("#assessments", number);
					}
				});
			} else {
				this.addBadge("#assessments", 0);
			}

			// add num results badge
			//
			if (this.options.data['project']) {
				ExecutionRecords.fetchNumByProject(this.options.data['project'], {
					data: this.getFilterData(['package', 'tool', 'platform']),

					success: function(number) {
						self.addBadge("#results", number);
					}
				});
			} else if (this.options.data['projects'] && this.options.data['projects'].length > 0) {
				ExecutionRecords.fetchNumByProjects(this.options.data['projects'], {
					data: this.getFilterData(['package', 'tool', 'platform']),

					success: function(number) {
						self.addBadge("#results", number);
					}
				});
			} else {
				this.addBadge("#results", 0);
			}
		},

		//
		// event handling methods
		//

		onClickAssessments: function() {
			var queryString = this.getQueryString();

			// go to assessments view
			//
			Backbone.history.navigate('#assessments' + (queryString != ''? '?' + queryString : ''), {
				trigger: true
			});
		},

		onClickResults: function() {
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
			this.showScheduledRunsList();
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