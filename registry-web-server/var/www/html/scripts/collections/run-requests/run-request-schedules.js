/******************************************************************************\
|                                                                              |
|                              run-request-schedules.js                        |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a collection of assessment run request schedules.        |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config',
	'scripts/models/run-requests/run-request-schedule'
], function($, _, Backbone, Config, RunRequestSchedule) {
	return Backbone.Collection.extend({

		//
		// Backbone attributes
		//

		model: RunRequestSchedule,
		url: Config.csaServer + '/run_request_schedules',

		//
		// ajax methods
		//

		fetchByRunRequest: function(runRequest, options) {
			return this.fetch(_.extend(options, {
				url: this.url + '/run_requests/' + runRequest.get('run_request_uuid')
			}));
		},

		// allow bulk saving
		//
		save: function(options) {
			this.sync('update', this, options);
		}
	});
});