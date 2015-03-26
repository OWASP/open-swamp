/******************************************************************************\
|                                                                              |
|                            assessments-results-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a project's current list of.        |
|        assessment runs and results.                                          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/assessment-results/assessments-results.tpl',
	'scripts/registry',
	'scripts/config',
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
	'scripts/views/assessment-results/assessment-runs/filters/assessment-runs-filters-view',
	'scripts/views/assessment-results/assessment-runs/list/assessment-runs-list-view'
], function($, _, Backbone, Marionette, Template, Registry, Config, Accordions, Project, RunRequest, Projects, AssessmentRuns, ExecutionRecords, ScheduledRuns, ConfirmView, NotifyView, ErrorView, AssessmentRunsFiltersView, AssessmentRunsListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			assessmentRunsFilters: '#assessment-runs-filters',
			assessmentRunsList: '#assessment-runs-list'
		},

		events: {
			'click #assessments': 'onClickAssessments',
			'click #runs': 'onClickRuns',
			'click #reset-filters': 'onClickResetFilters',
			'click button.view': 'onClickViewer',
			'click #show-numbering': 'onClickShowNumbering'
		},

		//
		// methods
		//

		initialize: function() {
			this.collection = new ExecutionRecords();
			this.checked = {};
		},

		//
		// querying methods
		//

		getCheckedAssessmentRuns: function() {

			// create array from associative array of checked items
			//
			var array = [];
			for (var key in this.checked) {
				var item = this.checked[key];
				array.push(item);
			}

			return array;
		},

		getCheckedAssessmentRunUuids: function() {
			return Object.keys( this.checked ).length > 0 ? encodeURIComponent( Object.keys( this.checked ).join(',') ) : 'none';
		},

		getAssesmentRunProjectUuid: function() {

			// check if some assessment runs are selected
			//
			var checkedAssessmentRuns = this.getCheckedAssessmentRuns();
			if (checkedAssessmentRuns.length > 0) {

				// use project from first checked run
				//
				return checkedAssessmentRuns[0].get('project_uuid');

			// check if a project filter is selected
			//
			} else if (this.options.data['project']) {
				return this.options.data['project'].get('project_uid');

			// use default project
			//
			} else {
				return this.model.get('project_uid');
			}
		},

		//
		// query string / filter methods
		//

		getQueryString: function() {
			return this.assessmentRunsFilters.currentView.getQueryString();
		},

		getFilterData: function(attributes) {
			return this.assessmentRunsFilters.currentView.getData(attributes);
		},

		//
		// ajax methods
		//

		fetchExecutionRecords: function(done) {
			var self = this;

			if (this.options.data['project']) {

				// fetch collection of execution records for a project
				//
				this.collection.fetchByProject(this.options.data['project'], {

					// attributes
					//
					data: this.getFilterData(['package', 'tool', 'platform', 'date', 'limit']),

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
								message: "Could not get execution records for this project."
							})
						);
					}
				});
			} else if (this.options.data['projects'] && this.options.data['projects'].length > 0) {

				// fetch collection of execution records for all projects
				//
				this.collection.fetchByProjects(this.options.data['projects'], {

					// attributes
					//
					data: this.getFilterData(['package', 'tool', 'platform', 'date', 'limit']),

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
								message: "Could not get execution records for these projects."
							})
						);
					}
				});
			} else {

				// no project
				//
				done(this.collection);
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
				viewers: this.options.viewers,
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
			this.assessmentRunsFilters.show(
				new AssessmentRunsFiltersView({
					model: this.model,
					data: this.options.data,

					// callbacks
					//
					onChange: function() {
						setQueryString(self.getQueryString());				
					}
				})
			);

			// show list subview
			//
			this.showAssessmentRunsList(function() {

				// set up refresh
				//
				self.interval = this.setInterval(function() {
					var sortList = self.assessmentRunsList.currentView.getSortList();
					self.showAssessmentRunsList(undefined, sortList);
				}, 10000);
			});

			// add count bubbles / badges
			//
			this.addBadges();
		},

		showAssessmentRunsList: function(done, sortList) {
			var self = this;

			// fetch execution records
			//
			this.fetchExecutionRecords(function() {

				// show assessment runs list view
				//
				self.assessmentRunsList.show(
					new AssessmentRunsListView({
						model: self.model,
						collection: self.collection,
						viewers: self.options.viewers,
						checked: self.checked,
						sortList: sortList,
						queryString: self.getQueryString(),
						showNumbering: Registry.application.getShowNumbering(),
						showResults: true,
						showDelete: true,
						showSsh: true
					})
				);

				if (done) {
					done();
				}
			});
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
		// viewer launching methods
		//

		consistentPackagesChecked: function() {
			var firstItem;

			for (var key in this.checked) {
				var item = this.checked[key];
				if (!firstItem) {
					firstItem = item;
				} else {
					var firstPackage = firstItem.get('package');
					var nextPackage = item.get('package');
					if (firstPackage.name != nextPackage.name || 
						firstPackage.version_string != nextPackage.version_string) {
						return false;
					}				
				}
			}

			return true;
		},

		showCodeDxViewer: function(viewer) {

			// check to ensure package names and versions all match
			//
			if (this.consistentPackagesChecked()) {
				var projectUuid = this.getAssesmentRunProjectUuid();
				if (projectUuid) {

					// open results window
					//
					var options = 'scrollbars=yes,directories=yes,titlebar=yes,toolbar=yes,location=yes';
					var results = this.getCheckedAssessmentRunUuids();
					var url = Registry.application.getURL() + '#results/' + results + '/viewer/' + viewer.get('viewer_uuid') + '/project/' + projectUuid;
					var target = '';
					var resultsWindow = window.open(url, target, options);

					// add to list of open viewer windows
					//
					document.openViewers = document.openViewers !== undefined ? document.openViewers: [];
					document.openViewers.push(resultsWindow);
				} else {

					// show error dialog
					//
					Registry.application.modal.show(
						new NotifyView({
							message: "Can't open CodeDx because no project has been selected."
						})
					);				
				}
			} else {

				// show error dialog
				//
				Registry.application.modal.show(
					new NotifyView({
						message: "Package names and versions must match to view multiple assessment results with CodeDX."
					})
				);	
			}
		},

		showNativeViewer: function(viewer) {
			var self = this;

			// display each checked assessment run
			//
			_.each(Object.keys(this.checked), function(assessment_result_uuid) {
				var assessmentResult = self.checked[assessment_result_uuid];
				var options = 'scrollbars=yes,directories=yes,titlebar=yes,toolbar=yes,location=yes';
				var url = Registry.application.getURL() + '#results/' + assessment_result_uuid + '/viewer/' + viewer.get('viewer_uuid') + '/project/' + assessmentResult.get('project_uuid');
				var target = '';

				var resultsWindow = window.open(url, target, options);

				// add to list of open viewer windows
				//
				document.openViewers = document.openViewers !== undefined ? document.openViewers: [];
				document.openViewers.push(resultsWindow);
			});
		},

		showViewer: function(viewer) {
			var self = this;
			$.ajax({
				type: 'GET',
				url: Config.csaServer + '/assessment_results/' + Object.keys( self.checked ).join(',') + 
					'/viewer/' + viewer.get('viewer_uuid') + 
					'/project/' + self.model.get('project_uid') + 
					'/permission', 

				// callbacks
				//
				success: function(){
					if (viewer.get('name').toLowerCase().indexOf('dx') != -1) {
						self.showCodeDxViewer(viewer);
					} else {
						self.showNativeViewer(viewer);
					}
				},

				error: function(response){
					var runRequest = new RunRequest({});
					runRequest.handleError(response);
				}
			});
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
						self.assessmentRunsFilters.currentView.reset();
					}
				})
			);
		},

		onClickViewer: function(event) {
			var index = parseInt($(event.target).attr("index"));
			var viewer = this.options.viewers.at(index);
			this.showViewer(viewer);
		},

		onClickShowNumbering: function(event) {
			Registry.application.setShowNumbering($(event.target).is(':checked'));
			this.showAssessmentRunsList();
		},

		//
		// cleanup methods
		//

		onBeforeDestroy: function() {
			if (this.interval) {
				window.clearInterval(this.interval);
			}
		}
	});
});
