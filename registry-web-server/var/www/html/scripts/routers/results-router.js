/******************************************************************************\
|                                                                              |
|                                  results-router.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the url routing that's used for results routes.          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/registry',
	'scripts/models/projects/project',
	'scripts/models/packages/package',
	'scripts/models/packages/package-version',
	'scripts/models/tools/tool',
	'scripts/models/tools/tool-version',
	'scripts/models/platforms/platform',
	'scripts/models/platforms/platform-version',
	'scripts/collections/projects/projects'
], function($, _, Backbone, Registry, Project, Package, PackageVersion, Tool, ToolVersion, Platform, PlatformVersion, Projects) {

	//
	// query string methods
	//
	
	function parseProjectQueryString(queryString, project) {

		// parse query string
		//
		var data = queryStringToData(queryString);

		// create project from query string data
		//
		if (data['project'] == 'none') {

			// use the default 'trial' project
			//
			data['project']	= project;	
		} else if (data['project'] == 'any' || !data['project']) {

			// use all projects
			//
			data['project'] = undefined;
			data['projects'] = new Projects();
		} else {

			// use a particular specified project
			//
			data['project'] = new Project({
				project_uid: data['project']
			});
		}

		return data;
	}

	function parseQueryString(queryString, project) {

		// parse query string
		//
		var data = parseProjectQueryString(queryString, project);

		// create models from query string data
		//
		if (data['package']) {
			data['package'] = new Package({
				package_uuid: data['package']
			});
		}
		if (data['package-version'] && data['package-version'] != 'latest') {
			data['package-version'] = new PackageVersion({
				package_version_uuid: data['package-version']
			});
		}
		if (data['tool']) {
			data['tool'] = new Tool({
				tool_uuid: data['tool']
			});
		}
		if (data['tool-version'] && data['tool-version'] != 'latest') {
			data['tool-version'] = new ToolVersion({
				tool_version_uuid: data['tool-version']
			});
		}
		if (data['platform']) {
			data['platform'] = new Platform({
				platform_uuid: data['platform']
			});
		}
		if (data['platform-version'] && data['platform-version'] != 'latest') {
			data['platform-version'] = new PlatformVersion({
				platform_version_uuid: data['platform-version']
			});
		}

		// parse limit
		//
		if (data['limit']) {
			if (data['limit'] != 'none') {
				data['limit'] = parseInt(data['limit']);
			} else {
				data['limit'] = null;
			}
		}

		return data;
	}

	function fetchQueryStringData(data, done) {

		// fetch models
		//
		$.when(
			data['project']? data['project'].fetch() : true,
			data['projects']? data['projects'].fetch() : true,
			data['package']? data['package'].fetch() : true,
			data['package-version'] && data['package-version'] != 'latest'? data['package-version'].fetch() : true,
			data['tool']? data['tool'].fetch() : true,
			data['tool-version'] && data['tool-version'] != 'latest'? data['tool-version'].fetch() : true,
			data['platform']? data['platform'].fetch() : true,
			data['platform-version'] && data['platform-version'] != 'latest'? data['platform-version'].fetch() : true
		).then(function() {

			// create models from version data
			//
			if (data['package-version'] && data['package-version'] != 'latest') {
				data['package'] = new Package({
					package_uuid: data['package-version'].get('package_uuid')
				});
			}
			if (data['tool-version'] && data['tool-version'] != 'latest') {
				data['tool'] = new Tool({
					tool_uuid: data['tool-version'].get('tool_uuid')
				});
			}
			if (data['platform-version'] && data['platform-version'] != 'latest') {
				data['platform'] = new Platform({
					platform_uuid: data['platform-version'].get('platform_uuid')
				});
			}

			// fetch models
			//
			$.when(
				data['package-version'] && data['package-version'] != 'latest'? data['package'].fetch() : true,
				data['tool-version'] && data['tool-version'] != 'latest'? data['tool'].fetch() : true,
				data['platform-version'] && data['platform-version'] != 'latest'? data['platform'].fetch() : true
			).then(function() {

				// perform callback
				//
				done(data);				
			});
		});
	}

	function showResultsData(data) {

		// display results in new window
		//
		if (data.results) {

			// insert results into DOM
			//
			window.document.write(data.results);

			// call window onload, if there is one
			//
			if (window.onload) {
				window.onload();
			}
		} else if (data.results_url) {
			if (data.results_url.indexOf('.tar.gz') >= 0) {
				window.location = data.results_url;
			} else {
				window.location = data.results_url + '/';
			}
		}
	}

	// create router
	//
	return Backbone.Router.extend({

		//
		// route definitions
		//

		routes: {

			// result administration routes
			//
			'results/review(?*query_string)': 'showReviewResults',

			// assessment results routes
			//
			'results/:assessment_results_uid/viewer/:viewer_uuid/project/:project_uuid': 'showAssessmentResultsViewer',
			'results(?*query_string)': 'showAssessmentsResults',

			// assessment run and result routes
			//
			'runs/:execution_record_uuid/status(?*query_string)': 'showAssessmentRun',
			'projects/:project_uid/results': 'showAssessmentResults'
		},

		//
		// result administration route handlers
		//

		showReviewResults: function(queryString) {
			require([
				'scripts/registry',
				'scripts/utilities/query-strings',
				'scripts/utilities/url-strings',
				'scripts/views/assessment-results/assessment-runs/review/review-results-view'
			], function (Registry, QueryStrings, UrlStrings, ReviewResultsView) {
				
				// show content view
				//
				Registry.application.showContent({
					'nav1': 'home',
					'nav2': 'overview', 

					// callbacks
					//
					done: function(view) {
						fetchQueryStringData(parseQueryString(queryString, view.model), function(data) {

							// show review results view
							//
							view.content.show(
								new ReviewResultsView({
									data: data
								})
							);
						});
					}
				});
			});
		},

		//
		// assessment results route handlers
		//

		showAssessmentResultsViewer: function(assessmentResultUuid, viewerUuid, projectUuid) {
			require([
				'jquery',
				'underscore',
				'scripts/models/assessments/assessment-results',
				'scripts/views/dialogs/error-view',
				'text!templates/viewers/progress.tpl',
				'scripts/registry'
			], function ($, _, AssessmentResults, ErrorView, Template, Registry) {

				// get assessment results
				//
				var assessmentResults = new AssessmentResults({
					assessment_result_uuid: assessmentResultUuid
				});

				var lastStatus = '';

				// call stored procedure
				//
				var getResults = function() {
					var options = {
						timeout: 0,

						// callbacks
						//
						success: function(data) {
							if (data.results_status === 'SUCCESS') {

								// display results in new window
								//
								showResultsData(data);
							} else if(data.results_status === 'LOADING') {

								// display viewer status and call again until ready
								//
								var template = _.template(Template, {
									viewer_status: data.results_viewer_status
								});

								// don't redraw if same status
								//
								if (template != lastStatus) {
									$('body').html(template);
									lastStatus = template;
								}

								// re-fetch without launching the viewer
								//
								setTimeout(function() {
									getInstanceStatus(data.viewer_instance);
								}, 3000);
							}
							else {
								// display results status error message
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Error fetching assessment results: " + data.results_status
									})
								);
							}
						},

						error: function() {

							// show error dialog
							//
							Registry.application.modal.show(
								new ErrorView({
									message: "Could not fetch assessment results content."
								})
							);
						}
					};

					assessmentResults.fetchResults(viewerUuid, projectUuid, options);
				};

				var getInstanceStatus = function(viewerInstanceUuid) {
					var options = {
						timeout: 0,

						// callbacks
						//
						success: function(data) {
							if (data.results_status === 'SUCCESS') {

								// display results in new window
								//
								showResultsData(data);
							} else if(data.results_status === 'LOADING') {

								// display viewer status and call again until ready
								//
								var template = _.template(Template, {
									viewer_status: data.results_viewer_status
								});

								// don't redraw if same status
								//
								if (template != lastStatus) {
									$('body').html(template);
									lastStatus = template;
								}

								// re-fetch without launching the viewer
								//
								setTimeout(function() {
									getInstanceStatus(data.viewer_instance)
								}, 3000);
							}
							else {
								// display results status error message
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Error fetching assessment results: " + data.results_status
									})
								);
							}
						},

						error: function() {

							// show error dialog
							//
							Registry.application.modal.show(
								new ErrorView({
									message: "Could not fetch assessment results content."
								})
							);
						}
					};

					assessmentResults.fetchInstanceStatus(viewerInstanceUuid, options);
				};

				// start refreshing
				//
				getResults();
			});
		},

		showAssessmentsResults: function(queryString) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/utilities/query-strings',
				'scripts/utilities/url-strings',
				'scripts/collections/viewers/viewers',
				'scripts/views/dialogs/error-view',
				'scripts/views/assessment-results/assessments-results-view'
			], function (Registry, QueryStrings, UrlStrings, Viewers, ErrorView, AssessmentsResultsView) {

				// show content view
				//
				Registry.application.showContent({
					nav1: 'home',
					nav2: 'results', 

					// callbacks
					//
					done: function(view) {
					
						// parse and fetch query string data
						//
						fetchQueryStringData(parseQueryString(queryString, view.model), function(data) {

							// fetch viewers
							//
							var viewers = new Viewers();
							viewers.fetchAll({

								// callbacks
								//
								success: function() {

									// show assessments results view
									//
									view.content.show(
										new AssessmentsResultsView({
											data: data,
											model: view.model,
											viewers: viewers
										})
									);
								},

								error: function() {

									// show error dialog
									//
									Registry.application.modal.show(
										new ErrorView({
											message: "Could not fetch project viewers."
										})
									);
								}
							});	
						});
					}
				});
			});
		},

		//
		// project assessment run route handlers
		//

		showAssessmentRun: function(executionRecordUuid, queryString) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/models/assessments/execution-record',
				'scripts/views/assessment-results/assessment-runs/assessment-run-view',
				'scripts/views/dialogs/error-view'
			], function (Registry, ExecutionRecord, AssessmentRunView, ErrorView) {

				// show content view
				//
				Registry.application.showContent({
					nav1: 'home',
					nav2: 'results', 

					// callbacks
					//
					done: function(view) {

						// get execution record
						//
						var executionRecord = new ExecutionRecord({
							execution_record_uuid: executionRecordUuid
						});

						executionRecord.fetch({

							// callbacks
							//
							success: function() {

								// fetch execution record's project
								//
								//
								var project = new Project({
									project_uid: executionRecord.get('project_uuid')
								});

								project.fetch({

									// callbacks
									//
									success: function() {

										// show assessment run view
										//
										view.content.show(
											new AssessmentRunView({
												model: executionRecord,
												project: project,
												queryString: queryString
											})
										);
									},

									error: function() {

										// show error dialog
										//
										Registry.application.modal.show(
											new ErrorView({
												message: "Could not fetch execution record's project."
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
										message: "Could not fetch execution record."
									})
								);
							}
						});
					}
				});
			});
		},

		//
		// project assessment results route handlers
		//

		showAssessmentResults: function(assessmentResultUuid) {
			require([
				'scripts/registry',
				'scripts/models/projects/project',
				'scripts/models/assessments/assessment-results',
				'scripts/views/assessment-results/assessment-results-view',
				'scripts/views/dialogs/error-view'
			], function (Registry, Project, AssessmentResults, AssessmentResultsView, ErrorView) {

				// get assessment results
				//
				var assessmentResults = new AssessmentResults({
					assessment_result_uuid: assessmentResultUuid
				});

				assessmentResults.fetch({

					// callbacks
					//
					success: function() {

						// fetch project
						//
						var project = new Project({
							project_uid: assessmentResults.get('project_uuid')
						});

						project.fetch({

							// callbacks
							//
							success: function() {

								// show assessment results view
								//
								Registry.application.show(
									new AssessmentResultsView({
										model: assessmentResults,
										project: project
									})
								);
							},

							error: function() {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Could not fetch project."
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
								message: "Could not fetch assessment results."
							})
						);
					}
				});
			});
		}
	});
});


