/******************************************************************************\
|                                                                              |
|                       package-version-dependency.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a version of a software package.                         |
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

		urlRoot: Config.csaServer + '/packages/versions/dependencies',

		//
		// overridden Backbone methods
		//

		url: function() {
			return this.urlRoot + (this.isNew()? '' : '/' + this.get('package_version_dependency_id'));
		},

		isNew: function() {
			return !this.has('package_version_dependency_id');
		}

	});
});
