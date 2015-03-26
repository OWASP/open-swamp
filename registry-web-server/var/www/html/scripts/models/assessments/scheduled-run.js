/******************************************************************************\
|                                                                              |
|                                scheduled-run.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of a single software assessment run.             |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'scripts/config',
	'scripts/models/assessments/assessment-run',
	'scripts/models/run-requests/run-request',
], function($, _, Config, AssessmentRun, RunRequest) {
	return AssessmentRun.extend({

		//
		// overridden Backbone methods
		//

		parse: function(response) {

			// call superclass method
			//
			AssessmentRun.prototype.parse.call(this, response);

			// parse run request
			//
			if (response.run_request) {
				response.run_request = new RunRequest(response.run_request);
			}

			return response;
		},
	});
});
