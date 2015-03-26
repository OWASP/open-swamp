/******************************************************************************\
|                                                                              |
|                              review-results-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing all runs and results.               |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/assessment-results/assessment-runs/review/review-results.tpl',
	'scripts/registry',
	'scripts/config',
	'scripts/widgets/accordions',
	'scripts/models/projects/project',
	'scripts/models/run-requests/run-request',
	'scripts/collections/assessments/execution-records',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/assessment-results/assessment-runs/filters/review-results-filters-view',
	'scripts/views/assessment-results/assessment-runs/list/assessment-runs-list-view'
], function($, _, Backbone, Marionette, Template, Registry, Config, Accordions, Project, RunRequest, ExecutionRecords, ConfirmView, NotifyView, ErrorView, ReviewResultsFiltersView, AssessmentRunsListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			assessmentRunsFilters: '#assessment-runs-filters',
			assessmentRunsList: '#assessment-runs-list'
		},

		events: {
			'click #view-assessments': 'onClickViewAssessments',
			'click #view-runs': 'onClickViewRuns',
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
		// ajax methods
		//

		fetchExecutionRecords: function(done) {
			this.collection.fetchAll({

				// attributes
				//
				data: this.assessmentRunsFilters.currentView? this.assessmentRunsFilters.currentView.getData() : null,

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
							message: "Could not get execution records."
						})
					);
				}
			});
		},

		//
		// querying methods
		//

		getQueryString: function() {
			return this.assessmentRunsFilters.currentView.getQueryString();
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
				showNumbering: Registry.application.getShowNumbering(),
				viewers: this.options.viewers
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
				new ReviewResultsFiltersView({
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
			this.showReviewAssessmentRunsList(function() {

				// set up refresh
				//
				self.interval = this.setInterval(function() {
					var sortList = self.assessmentRunsList.currentView.getSortList();
					self.showReviewAssessmentRunsList(undefined, sortList);
				}, 10000);
			});
		},

		showReviewAssessmentRunsList: function(done, sortList) {
			var self = this;
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
						showResults: false,
						showDelete: false,
						showSsh: false
					})
				);

				if (done) {
					done();
				}
			});
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
			var self = this;

			// check to ensure package names and versions all match
			//
			if (this.consistentPackagesChecked()) {

				// open results window
				//
				var options = 'scrollbars=yes,directories=yes,titlebar=yes,toolbar=yes,location=yes';
				var results = Object.keys( this.checked ).length > 0 ? encodeURIComponent( Object.keys( this.checked ).join(',') ) : 'none';
				var url = Registry.application.getURL() + '#results/' + results + '/viewer/' + viewer.get('viewer_uuid') + '/project/' + self.model.get('project_uid');
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
						message: "Package names and versions must match to view multiple assessment results with CodeDX."
					})
				);	
			}
		},

		showNativeViewer: function(viewer) {
			var self = this;

			_.each( Object.keys( this.checked ),  function( assessment_result_uuid ){	
				var options = 'scrollbars=yes,directories=yes,titlebar=yes,toolbar=yes,location=yes';
				var url = Registry.application.getURL() + '#results/' + assessment_result_uuid + '/viewer/' + viewer.get('viewer_uuid') + '/project/' + self.model.get('project_uid');
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
				success: function(){
					if (viewer.get('name').toLowerCase().indexOf('dx') != -1) {
						self.showCodeDxViewer(viewer);
					} else {
						self.showNativeViewer(viewer);
					}
				},
				error: function( res ){
					var rr = new RunRequest({});
					rr.handleError( res );
				}
			});
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

		onClickViewRuns: function() {
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
			this.showReviewAssessmentRunsList();
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
