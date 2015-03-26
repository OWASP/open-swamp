/******************************************************************************\
|                                                                              |
|                              assessments-results.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of assessment runs.                    |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config',
	'scripts/models/assessments/assessment-results'
], function($, _, Backbone, Config, AssessmentResults) {
	return Backbone.Collection.extend({

		//
		// Backbone attributes
		//

		model: AssessmentResults,

		//
		// ajax methods
		//

		fetchByProject: function(project, options) {
			return this.fetch(_.extend(options, {
				url: Config.csaServer + '/projects/' + project.get('project_uid') + '/assessment_results'
			}));
		}
	});
});