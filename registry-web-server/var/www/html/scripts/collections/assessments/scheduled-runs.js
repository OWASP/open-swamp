/******************************************************************************\
|                                                                              |
|                                 scheduled-runs.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of scheduled assessment runs.          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config',
	'scripts/models/assessments/scheduled-run',
	'scripts/collections/assessments/assessment-runs'
], function($, _, Backbone, Config, ScheduledRun, AssessmentRuns) {
	return AssessmentRuns.extend({

		//
		// Backbone attributes
		//

		model: ScheduledRun,

		//
		// ajax methods
		//

		fetchByProject: function(project, options) {
			return this.fetch(_.extend(options, {
				url: Config.csaServer + '/projects/' + project.get('project_uid') + '/assessment_runs/scheduled'
			}));
		},

		fetchByProjects: function(projects, options) {
			return this.fetch(_.extend(options, {
				url: Config.csaServer + '/projects/' + projects.getUuidsStr() + '/assessment_runs/scheduled'
			}));
		},
	}, {

		//
		// static methods
		//

		fetchNumByProject: function(project, options) {
			return $.ajax(Config.csaServer + '/projects/' + project.get('project_uid') + '/assessment_runs/scheduled/num', options);
		},

		fetchNumByProjects: function(projects, options) {
			return $.ajax(Config.csaServer + '/projects/' + projects.getUuidsStr() + '/assessment_runs/scheduled/num', options);
		},
	});
});