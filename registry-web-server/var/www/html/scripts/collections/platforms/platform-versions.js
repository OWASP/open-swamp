/******************************************************************************\
|                                                                              |
|                               platform-versions.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of platform versions.                  |                                                  |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config',
	'scripts/models/platforms/platform-version',
	'scripts/collections/utilities/versions'
], function($, _, Backbone, Config, PlatformVersion, Versions) {
	return Versions.extend({

		//
		// Backbone attributes
		//

		model: PlatformVersion,

		//
		// ajax methods
		//

		fetchAll: function(options) {
			return this.fetch(_.extend(options, {
				url: Config.csaServer + '/platforms/versions/all'
			}));
		},

		fetchByPlatform: function(platform, options) {
			return this.fetch(_.extend(options, {
				url: Config.csaServer + '/platforms/' + platform.get('platform_uuid') + '/versions'
			}));
		}
	});
});
