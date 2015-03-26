/******************************************************************************\
|                                                                              |
|                                 assessments-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for running or scheduling assessments.          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/assessments/assessments.tpl',
	'scripts/registry',
	'scripts/widgets/accordions',
	'scripts/models/projects/project',
	'scripts/models/run-requests/run-request',
	'scripts/collections/projects/projects',
	'scripts/collections/assessments/assessment-runs',
	'scripts/collections/assessments/execution-records',
	'scripts/collections/assessments/scheduled-runs',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/assessments/filters/assessment-filters-view',
	'scripts/views/assessments/select-list/select-assessments-list-view',
	'scripts/views/assessments/dialogs/confirm-run-request-view'
], function($, _, Backbone, Marionette, Template, Registry, Accordions, Project, RunRequest, Projects, AssessmentRuns, ExecutionRecords, ScheduledRuns, ConfirmView, NotifyView, ErrorView, AssessmentFiltersView, SelectAssessmentsListView, ConfirmRunRequestView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			assessmentFilters: '#assessment-filters',
			selectAssessmentsList: '#select-assessments-list'
		},

		events: {
			'click #results': 'onClickResults',
			'click #runs': 'onClickRuns',
			'click #reset-filters': 'onClickResetFilters',
			'click #run-new-assessment': 'onClickRunNewAssessment',
			'click #show-numbering': 'onClickShowNumbering',
			'click #run-assessments': 'onClickRunAssessments',
			'click #schedule-assessments': 'onClickScheduleAssessments',
			'click #delete-assessments': 'onClickDeleteAssessments'
		},

		//
		// methods
		//

		initialize: function() {
			var self = this;

			// set attributes
			//
			this.collection = new AssessmentRuns();

			// parse list of assessment run uuids
			//
			if (this.options.data['assessments']) {
				this.selectedAssessmentRunUuids = this.options.data['assessments'].split('+');
			}
		},

		//
		// ajax methods
		//

		fetchAssessments: function(done) {
			var self = this;

			if (this.options.data['project']) {

				// fetch assessments for a single project
				//
				this.collection.fetchByProject(this.options.data['project'], {

					// attributes
					//
					data: this.getFilterData(['package', 'tool', 'platform', 'limit']),

					// callbacks
					//
					success: function() {
						done(self.collection);
					},

					error: function() {

						// show error dialog
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "Could not get assessments for this project."
							})
						);
					}
				});
			} else if (this.options.data['projects'] && this.options.data['projects'].length > 0) {

				// fetch assessments for all projects
				//
				this.collection.fetchByProjects(this.options.data['projects'], {

					// attributes
					//
					data: this.getFilterData(['package', 'tool', 'platform', 'limit']),

					// callbacks
					//
					success: function() {
						done(self.collection);
					},

					error: function() {

						// show error dialog
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "Could not get assessments for all projects."
							})
						);
					}
				});
			} else {

				// no projects
				//
				done(this.collection);
			}
		},

		scheduleOneTimeRunRequests: function(assessmentRuns, notifyWhenComplete) {
			var self = this;
			var runRequest = new RunRequest();

			// save run requests
			//
			runRequest.saveOneTimeRunRequests(assessmentRuns.getUuids(), notifyWhenComplete, {

				// callbacks
				//
				success: function() {

					// show success notification dialog
					//
					Registry.application.modal.show(
						new NotifyView({
							message: "Your assessment run has been started.",

							// callbacks
							//
							accept: function() {
								var queryString = self.getQueryString();

								// go to runs / results view
								//								
								Backbone.history.navigate('#results' + (queryString != ''? '?' + queryString : ''), {
									trigger: true
								});
							}
						})
					);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not save collection of run request assocs."
						})
					);		
				}
			});
		},

		deleteAssessments: function(assessments, done) {

			// delete assessments individually
			//
			var successes = 0, errors = 0, count = assessments.length;
			for (var i = 0; i < count; i++) {
				var assessment = assessments.pop();
				assessment.destroy({

					// callbacks
					//
					success: function(model, response, options) {
						successes++;

						// perform callback when complete
						//
						if (successes === assessments.length) {
							if (done) {
								assessments.reset();
								done();
							}
						}
					},

					error: function(model, response) {
						errors++;

						// report first error
						//
						if (errors === 1) {

							// show error dialog
							//
							Registry.application.modal.show(
								new ErrorView({
									message: "Could not delete assessment."
								})
							);
						}
					}
				});
			}
		},

		//
		// query string / filter methods
		//

		getQueryString: function() {
			var queryString = this.assessmentFilters.currentView.getQueryString();
			var selectedAssessments = this.selectAssessmentsList.currentView.getSelected();

			if (selectedAssessments.length > 0) {
				queryString = addQueryString(queryString, 'assessments=' + selectedAssessments.getUuidsStr());
			}

			return queryString;
		},

		getFilterData: function(attributes) {
			return this.assessmentFilters.currentView.getData(attributes);
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

			// show assessment results filters view
			//
			this.assessmentFilters.show(
				new AssessmentFiltersView({
					model: this.model,
					data: this.options.data,

					// callbacks
					//
					onChange: function() {
						setQueryString(self.getQueryString());	
					}
				})
			);

			// fetch and show assessments
			//
			this.fetchAssessments(function() {
				self.showAssessmentsList();
			});

			// add count bubbles / badges
			//
			this.addBadges();
		},

		showAssessmentsList: function() {

			// show select assessments list view
			//
			this.selectAssessmentsList.show(
				new SelectAssessmentsListView({
					model: this.model,
					collection: this.collection,
					selectedAssessmentRunUuids: this.selectedAssessmentRunUuids,
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

			// add num scheduled runs badge
			//
			if (this.options.data['project']) {
				ScheduledRuns.fetchNumByProject(this.options.data['project'], {
					data: this.getFilterData(['package', 'tool', 'platform']),

					success: function(number) {
						self.addBadge("#runs", number);
					}
				});
			} else if (this.options.data['projects'] && this.options.data['projects'].length > 0) {
				ScheduledRuns.fetchNumByProjects(this.options.data['projects'], {
					data: this.getFilterData(['package', 'tool', 'platform']),

					success: function(number) {
						self.addBadge("#runs", number);
					}
				});
			} else {
				this.addBadge("#runs", 0);
			}
		},

		//
		// event handling methods
		//

		onClickResults: function() {
			var queryString = this.getQueryString();

			// go to assessment results view
			//
			Backbone.history.navigate('#results' + (queryString != ''? '?' + queryString : ''), {
				trigger: true
			});
		},

		onClickRuns: function() {
			var queryString = this.getQueryString();

			// go to run requests view
			//
			Backbone.history.navigate('#run-requests' + (queryString != ''? '?' + queryString : ''), {
				trigger: true
			});
		},

		onClickResetFilters: function() {
			var self = this;

			// show confirm dialog
			//
			Registry.application.modal.show(
				new ConfirmView({
					title: "Reset filters",
					message: "Are you sure that you would like to reset your filters?",

					// callbacks
					//
					accept: function() {
						self.assessmentFilters.currentView.reset();
					}
				})
			);
		},

		onClickRunNewAssessment: function() {
			var project = this.options.data['project'] || this.model;

			if (project) {
				var queryString = this.getQueryString();

				// go to add new assessment view
				//
				Backbone.history.navigate('#assessments/run' + (queryString != ''? '?' + queryString : ''), {
					trigger: true
				});			
			} else {

				// show notify dialog
				//
				Registry.application.modal.show(
					new NotifyView({
						message: "To run a new assessment, you must first select a project."
					})
				);
			}
		},

		onClickShowNumbering: function(event) {
			Registry.application.setShowNumbering($(event.target).is(':checked'));
			this.showAssessmentsList();
		},

		onClickRunAssessments: function() {
			var self = this;
			var selectedAssessmentRuns = this.selectAssessmentsList.currentView.getSelected();
			
			if (selectedAssessmentRuns.length > 0) {

				// show confirm dialog box
				//
				Registry.application.modal.show(
					new ConfirmRunRequestView({
						selectedAssessmentRuns: selectedAssessmentRuns,

						// callbacks
						//
						accept: function(selectedAssessmentRuns, notifyWhenComplete) {
							self.scheduleOneTimeRunRequests(selectedAssessmentRuns, notifyWhenComplete);
						}
					})
				);
			} else {

				// show no assessments selected notify view
				//
				Registry.application.modal.show(
					new NotifyView({
						message: "No assessments were selected.  To run an assessment, please select at least one item from the list of assessments."
					})
				);
			}	
		},

		onClickScheduleAssessments: function() {
			if (this.options.data['project']) {
				var self = this;
				var selectedAssessments = this.selectAssessmentsList.currentView.getSelected();
				if (selectedAssessments.length > 0) {
					var queryString = this.getQueryString();

					// go to run requests schedule view
					//
					Backbone.history.navigate('/run-requests/add' + (queryString != ''? '?' + queryString : ''), {
						trigger: true
					});	
				} else {

					// show no assessments selected notify view
					//
					Registry.application.modal.show(
						new NotifyView({
							message: "No assessments were selected.  To schedule an assessment, please select at least one item from the list of assessments."
						})
					);
				}
			} else {

				// show select project notify view
				//
				Registry.application.modal.show(
					new NotifyView({
						message: "No project was selected.  To schedule an assessment, please select a project (or no project) from the project filter."
					})
				);
			}
		},

		onClickDeleteAssessments: function() {
			var self = this;
			var selectedAssessments = this.selectAssessmentsList.currentView.getSelected();

			if (selectedAssessments.length > 0) {

				if (selectedAssessments.length > 1) {
					var message = "Are you sure that you would like to delete these " + selectedAssessments.length + " assessments?";
				} else {
					var message = "Are you sure that you would like to delete this assessment.";
				}

				// show confirm dialog
				//
				Registry.application.modal.show(
					new ConfirmView({
						title: "Delete Assessments",
						message: message,

						// callbacks
						//
						accept: function() {
							self.deleteAssessments(selectedAssessments, function() {

								// update list of assessments
								//
								self.showAssessmentsList();
							});
						}
					})
				);
			} else {

				// show no assessments selected notify view
				//
				Registry.application.modal.show(
					new NotifyView({
						message: "No assessments were selected.  To delete an assessment, please select at least one item from the list of assessments."
					})
				);
			}	
		}
	});
});