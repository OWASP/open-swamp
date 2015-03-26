/******************************************************************************\
|                                                                              |
|                                 run-requests.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of assessment run requests.            |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config',
	'scripts/models/run-requests/run-request'
], function($, _, Backbone, Config, RunRequest) {
	return Backbone.Collection.extend({

		//
		// Backbone attributes
		//

		model: RunRequest,
		url: Config.csaServer + '/run_requests',

		//
		// methods
		//

		findRunRequestsByName: function(name) {
			var runRequests = [];
			for (var i = 0; i < this.length; i++) {
				if (this.at(i).get('name') === name) {
					runRequests.push(this.at(i));
				}
			}
			return runRequests;
		},

		//
		// ajax methods
		//

		fetchByAssessmentRun: function(assessmentRun, options) {
			return this.fetch(_.extend(options, {
				url: Config.csaServer + '/assessment_runs/' + assessmentRun.get('assessment_run_uuid') + '/run_requests'
			}));
		},

		fetchByProject: function(project, options) {
			return this.fetch(_.extend(options, {
				url: Config.csaServer + '/projects/' + project.get('project_uid') + '/run_requests/schedules'
			}));
		},

		fetchByProjects: function(projects, options) {
			return this.fetch(_.extend(options, {
				url: Config.csaServer + '/projects/' + projects.getUuidsStr() + '/run_requests/schedules'
			}));
		},
	}, {

		//
		// static methods
		//

		fetchNumSchedulesByProject: function(project, options) {
			return $.ajax(Config.csaServer + '/projects/' + project.get('project_uid') + '/run_requests/schedules/num', options);
		},

		fetchNumSchedulesByProjects: function(projects, options) {
			return $.ajax(Config.csaServer + '/projects/' + projects.getUuidsStr() + '/run_requests/schedules/num', options);
		}
	});
});