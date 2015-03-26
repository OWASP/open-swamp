/******************************************************************************\
|                                                                              |
|                                assessment-run.js                             |
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
	'scripts/models/utilities/timestamped'
], function($, _, Config, Timestamped) {
	return Timestamped.extend({

		//
		// Backbone attributes
		//

		urlRoot: Config.csaServer + '/assessment_runs',

		//
		// overridden Backbone methods
		//

		url: function() {
			return this.urlRoot + (this.isNew()? '' : '/' + this.get('assessment_run_uuid'));
		},

		isNew: function() {
			return !this.has('assessment_run_uuid');
		},

		checkCompatibility: function(options) {
			$.ajax(_.extend(options, {
				url: this.urlRoot + '/check_compatibility',
				type: 'POST'
			}));
		}
	});
});
