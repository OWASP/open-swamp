/******************************************************************************\
|                                                                              |
|                                 platform-router.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the url routing that's used for platform routes.         |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone'
], function($, _, Backbone) {

	// create router
	//
	return Backbone.Router.extend({

		//
		// route definitions
		//

		routes: {

			// platforms routes
			//
			'platforms/public': 'showPublicPlatforms',

			// platform routes
			//
			'platforms/:platform_uuid': 'showPlatform',

			// platform version routes
			//
			'platforms/versions/:platform_version_uuid': 'showPlatformVersion',
		},

		//
		// platforms route handlers
		//

		showPublicPlatforms: function() {
			require([
				'scripts/registry',
				'scripts/views/platforms/public-platforms-view'
			], function (Registry, PublicPlatformsView) {

				// show public platforms view
				//
				Registry.application.showMain(
					new PublicPlatformsView(), {
						nav: 'resources'
					}
				);
			});
		},

		//
		// platform route helper functions
		//

		showPlatformView: function(platformUuid, options) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/models/platforms/platform',
				'scripts/views/dialogs/error-view',
				'scripts/views/platforms/platform-view'
			], function (Registry, Platform, ErrorView, PlatformView) {
				Platform.fetch(platformUuid, function(platform) {

					// check if user is logged in
					//
					if (Registry.application.session.user) {

						// show content view
						//
						Registry.application.showContent({
							nav1: platform.isOwned()? 'home' : 'resources',
							nav2: platform.isOwned()? 'platforms' : undefined, 

							// callbacks
							//	
							done: function(view) {
								view.content.show(
									new PlatformView({
										model: platform,
										nav: options.nav,
										parent: view
									})
								);

								if (options.done) {
									options.done(view.content.currentView);
								}				
							}					
						});
					} else {

						// show single column platform view
						//
						Registry.application.showMain(
							new PlatformView({
								model: package,
								nav: options.nav
							}), {
							done: options.done
						});
					}
				});
			});
		},

		//
		// platform route handlers
		//

		showPlatform: function(platformUuid) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/views/platforms/info/details/platform-details-view'
			], function (Registry, PlatformDetailsView) {

				// show platform view
				//
				self.showPlatformView(platformUuid, {
					nav: 'details',

					// callbacks
					//
					done: function(view) {

						// show platform details view
						//
						view.platformInfo.show(
							new PlatformDetailsView({
								model: view.model
							})
						);
					}
				});
			});
		},

		//
		// platform version route handlers
		//

		showPlatformVersion: function(platformVersionUuid, options) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/models/platforms/platform',
				'scripts/models/platforms/platform-version',
				'scripts/views/dialogs/error-view',
				'scripts/views/platforms/info/versions/platform-version/platform-version-view'
			], function (Registry, Platform, PlatformVersion, ErrorView, PlatformVersionView) {
				PlatformVersion.fetch(platformVersionUuid, function(platformVersion) {
					Platform.fetch(platformVersion.get('platform_uuid'), function(platform) {

						// check if user is logged in
						//
						if (Registry.application.session.user) {

							// show content view
							//
							Registry.application.showContent({
								nav1: platform.isOwned()? 'home' : 'resources',
								nav2: platform.isOwned()? 'platforms' : undefined, 

								// callbacks
								//	
								done: function(view) {
									view.content.show(
										new PlatformVersionView({
											model: platformVersion,
											platform: platform,
											parent: view
										})
									);

									if (options && options.done) {
										options.done(view.content.currentView);
									}				
								}					
							});
						} else {

							// show single column package version view
							//
							Registry.application.showMain(
								new PlatformVersionView({
									model: platformVersion,
									platform: platform
								}), {
								done: options.done
							});
						}
					});
				});
			});
		},
	});
});


