/******************************************************************************\
|                                                                              |
|                                platform-version.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a version of an operating system platform.               |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'scripts/config',
	'scripts/models/utilities/shared-version'
], function($, _, Config, SharedVersion) {
	var Class = SharedVersion.extend({

		//
		// Backbone attributes
		//

		urlRoot: Config.csaServer + '/platforms/versions',

		//
		// overridden Backbone methods
		//

		url: function() {
			return this.urlRoot + (this.isNew()? '' : '/' + this.get('platform_version_uuid'));
		},

		isNew: function() {
			return !this.has('platform_version_uuid');
		}
	}, {

		//
		// static methods
		//

		fetch: function(platformVersionUuid, done) {

			// fetch platform version
			//
			var platformVersion = new Class({
				platform_version_uuid: platformVersionUuid
			});

			platformVersion.fetch({

				// callbacks
				//
				success: function() {
					done(platformVersion);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch platform version."
						})
					);
				}
			});
		}
	});

	return Class;
});