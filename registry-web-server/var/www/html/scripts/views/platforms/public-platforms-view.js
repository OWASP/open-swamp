/******************************************************************************\
|                                                                              |
|                                public-platforms-view.js                      |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This is a view for showing a list of publicly available platforms.    |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/info/resources/platforms.tpl',
	'scripts/registry',
	'scripts/collections/platforms/platforms',
	'scripts/views/dialogs/error-view',
	'scripts/views/platforms/list/platforms-list-view'
], function($, _, Backbone, Marionette, Template, Registry, Platforms, ErrorView, PlatformsListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			platformsList: '#platforms-list'
		},

		//
		// methods
		//

		initialize: function() {
			this.collection = new Platforms();
		},

		//
		// rendering methods
		//


		template: function(data) {
			return _.template(Template, _.extend(data, {
				loggedIn: Registry.application.session.user != null
			}));
		},

		onRender: function() {

			// show subviews
			//
			this.showPlatformsList();
		},

		showPlatformsList: function() {
			var self = this;
			this.collection.fetchPublic({

				// callbacks
				//
				success: function() {

					// show list of platforms
					//
					self.platformsList.show(
						new PlatformsListView({
							collection: self.collection
						})
					);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not get list of platforms."
						})
					);
				}
			})
		}
	});
});
