/******************************************************************************\
|                                                                              |
|                               platform-details-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a platforms's details info.         |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/platforms/info/details/platform-details.tpl',
	'scripts/registry',
	'scripts/collections/platforms/platform-versions',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/platforms/info/details/platform-profile/platform-profile-view',
	'scripts/views/platforms/info/versions/platform-versions-list/platform-versions-list-view'
], function($, _, Backbone, Marionette, Template, Registry, PlatformVersions, ConfirmView, NotifyView, ErrorView, PlatformProfileView, PlatformVersionsListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			platformProfile: '#platform-profile',
			platformVersionsList: '#platform-versions-list'
		},

		events: {
			'click #run-new-assessment': 'onClickRunNewAssessment'
		},

		//
		// methods
		//

		initialize: function() {
			this.collection = new PlatformVersions();
		},

		//
		// ajax methods
		//

		fetchPlatformVersions: function(done) {
			var self = this;
			this.collection.fetchByPlatform(this.model, {

				// callbacks
				//
				success: function() {
					done();
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch platform versions."
						})
					);
				}
			});
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, data);
		},

		onRender: function() {
			var self = this;

			// display platform profile view
			//
			this.platformProfile.show(
				new PlatformProfileView({
					model: this.model
				})
			);

			// fetch and show platform versions
			//
			this.fetchPlatformVersions(function() {
				self.showPlatformVersions();	
			});
		},

		showPlatformVersions: function() {

			// show platform versions list view
			//
			this.platformVersionsList.show(
				new PlatformVersionsListView({
					model: this.model,
					collection: this.collection
				})
			);
		},

		//
		// event handling methods
		//

		onClickRunNewAssessment: function() {

			// go to run new assessment view
			//
			Backbone.history.navigate('#assessments/run?platform=' + this.model.get('platform_uuid'), {
				trigger: true
			});
		},
	});
});
