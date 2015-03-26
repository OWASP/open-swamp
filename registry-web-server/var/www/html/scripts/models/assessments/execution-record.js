/******************************************************************************\
|                                                                              |
|                                 execution-record.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of an execution record.                          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'scripts/config',
	'scripts/models/utilities/timestamped'
], function($, _, Config, Timestamped) {
	return Timestamped.extend({

		//
		// Backbone attributes
		//

		urlRoot: Config.csaServer + '/execution_records',

		//
		// querying methods
		//

		getProjectExecutionRecordsUrl: function(project) {
			return Config.csaServer + '/projects/' + project.get('project_uuid') + '/execution_records';
		},

		hasErrors: function() {
			return this.get('status').indexOf('errors') != -1;
		},

		isVmReady: function() {
			return this.get('vm_ready_flag') == '1';
		},

		//
		// overridden Backbone methods
		//

		url: function() {
			return this.urlRoot + (this.isNew()? '' : '/' + this.get('execution_record_uuid'));
		},

		isNew: function() {
			return !this.has('execution_record_uuid');
		},

		parse: function(response) {

			// call superclass method
			//
			response = Timestamped.prototype.parse.call(this, response);

			// convert dates from strings to objects
			//
			if (response.run_date) {
				response.run_date = new Date(Date.parseIso8601(response.run_date));
			}
			if (response.completion_date) {
				response.completion_date = new Date(Date.parseIso8601(response.completion_date));
			}

			return response;
		},

		getSshAccess: function( config ){
			$.ajax( _.extend( config, {
				type: 'GET',
				url: Config.csaServer + '/execution_records/' + this.get('execution_record_uuid') + '/ssh_access'
			}));
		}
	});
});
