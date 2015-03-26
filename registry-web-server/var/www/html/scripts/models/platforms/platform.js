/******************************************************************************\
|                                                                              |
|                                   platform.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of a software platform for packages and          |
|        tools.                                                                |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'scripts/config',
	'scripts/registry',
	'scripts/models/utilities/timestamped'
], function($, _, Config, Registry, Timestamped) {
	var Class = Timestamped.extend({

		//
		// Backbone attributes
		//

		urlRoot: Config.csaServer + '/platforms',

		//
		// querying methods
		//

		isOwned: function() {
			return this.isOwnedBy(Registry.application.session.user);		
		},

		isOwnedBy: function(user) {
			return (user && this.get('platform_owner_uuid') === user.get('user_uid'));
		},

		isDeactivated: function() {
			return (this.hasDeleteDate());
		},

		getUploadUrl: function() {
			return this.urlRoot + '/upload';
		},

		getSharingUrl: function() {
			return this.urlRoot + '/' + this.get('platform_uuid') + '/sharing';
		},

		supports: function(tool) {
			var platformNames = tool.get('platform_names');
			if (platformNames) {
				return (platformNames.indexOf(this.get('name')) != -1);
			}
		},

		//
		// scoping methods
		//

		isPublic: function() {
			return this.has('platform_sharing_status') &&
				this.get('platform_sharing_status').toLowerCase() === 'pubic';
		},

		isPrivate: function() {
			return this.has('platform_sharing_status') &&
				this.get('platform_sharing_status').toLowerCase() === 'private';
		},

		isProtected: function() {
			return this.has('platform_sharing_status') &&
				this.get('platform_sharing_status').toLowerCase() === 'protected';
		},

		//
		// overridden Backbone methods
		//

		url: function() {
			return this.urlRoot + (this.isNew()? '' : '/' + this.get('platform_uuid'));
		},

		isNew: function() {
			return !this.has('platform_uuid');
		}
	}, {

		//
		// static methods
		//

		fetch: function(platformUuid, done) {

			// fetch platform
			//
			var platform = new Class({
				platform_uuid: platformUuid
			});

			platform.fetch({

				// callbacks
				//
				success: function() {
					done(platform);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch platform."
						})
					);
				}
			});
		}
	});

	return Class;
});