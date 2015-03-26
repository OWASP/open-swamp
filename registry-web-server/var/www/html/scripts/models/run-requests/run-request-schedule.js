/******************************************************************************\
|                                                                              |
|                              run-request-schedule.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of run request schedule's recurrence.            |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config'
], function($, _, Backbone, Config) {
	return Backbone.Model.extend({

		//
		// attributes
		//

		defaults: {
			'recurrence_type': undefined,
			'recurrence_day': undefined,
			'time_of_day': undefined
		},

		//
		// Backbone attributes
		//

		urlRoot: Config.csaServer + '/run_request_schedules',
		
		//
		// overridden Backbone methods
		//

		url: function() {
			return this.urlRoot + (this.isNew()? '' : '/' + this.get('run_request_schedule_uuid'));
		},

		isNew: function() {
			return !this.has('run_request_schedule_uuid');
		}
	});
});