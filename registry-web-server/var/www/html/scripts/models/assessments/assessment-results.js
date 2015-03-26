/******************************************************************************\
|                                                                              |
|                               assessment-results.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of a set of assessment results.                  |
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

		urlRoot: Config.csaServer + '/assessment_results',

		//
		// ajax methods
		//

		fetchFile: function(options) {
			$.ajax(_.extend(options, {
				type: 'GET',
				url: this.model.get('file_host') + '/' + this.model.get('file_path'),
				dataType: 'xml',

				// make sure to send credentials
				//
				xhrFields: {
					withCredentials: true
				}
			}));
		},

		fetchResults: function(viewerUuid, projectUuid, options) {
			$.ajax(_.extend(options, {
				type: 'GET',
				url: this.urlRoot + '/' + this.get('assessment_result_uuid') + '/viewer/' + viewerUuid + '/project/' + projectUuid
			}));
		},

		// Refresh status for viewer while launching
		//
		fetchInstanceStatus: function(viewerInstanceUuid, options) {
			$.ajax(_.extend(options, {
				type: 'GET',
				url: this.urlRoot + '/viewer_instance/' + viewerInstanceUuid
			}));
		},

		//
		// overridden Backbone methods
		//

		url: function() {
			return this.urlRoot + (this.isNew()? '' : '/' + this.get('assessment_result_uuid'));
		},

		isNew: function() {
			return !this.has('assessment_result_uuid');
		}
	});
});
