/******************************************************************************\
|                                                                              |
|                         package-version-details-view.js                      |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a package version's details.        |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/packages/info/versions/info/details/package-version-details.tpl',
	'scripts/registry',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/packages/info/versions/info/details/package-version-profile/package-version-profile-view'
], function($, _, Backbone, Marionette, Template, Registry, ConfirmView, NotifyView, ErrorView, PackageVersionProfileView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			packageVersionProfile: '#package-version-profile',
		},

		events: {
			'click #run-new-assessment': 'onClickRunNewAssessment',
			'click #download-version': 'onClickDownloadVersion',
			'click #edit-version': 'onClickEditVersion',
			'click #delete-version': 'onClickDeleteVersion',
			'click #cancel': 'onClickCancel',
			'click #next': 'onClickNext'
		},

		//
		// rendering methods
		//


		template: function(data) {
			return _.template(Template, _.extend(data, {
				package: this.options.package,
				isOwned: this.options.package.isOwned(),
				isPublic: this.options.package.isPublic(),
				isAdmin: Registry.application.session.isAdmin(),
				showNavigation: this.options.showNavigation
			}));
		},

		onRender: function() {

			// display package version profile view
			//
			this.packageVersionProfile.show(
				new PackageVersionProfileView({
					model: this.model,
					package: this.options.package
				})
			);
		},

		//
		// event handling methods
		//

		onClickRunNewAssessment: function() {

			// go to run new assessment view
			//
			Backbone.history.navigate('#assessments/run?package-version=' + this.model.get('package_version_uuid'), {
				trigger: true
			});
		},

		onClickDownloadVersion: function() {
			this.model.download();
		},

		onClickEditVersion: function() {

			// go to edit package version details view
			//
			Backbone.history.navigate('#packages/versions/' + this.model.get('package_version_uuid') + '/edit', {
				trigger: true
			});
		},

		onClickDeleteVersion: function() {
			var self = this;

			// show confirm dialog
			//
			Registry.application.modal.show(
				new ConfirmView({
					title: "Delete Package",
					message: "Are you sure that you would like to delete package version " + self.model.get('version_string') + "? " +
						"When you delete a package version, all of the data will continue to be retained.",

					// callbacks
					//
					accept: function() {

						// delete user
						//
						self.model.destroy({

							// callbacks
							//
							success: function() {

								// return to package view
								//
								Backbone.history.navigate('#packages/' + self.model.get('package_uuid'), {
									trigger: true
								});
							},

							error: function() {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Could not delete this package version."
									})
								);
							}
						});
					}
				})
			);
		},

		onClickCancel: function() {

			// go to package version view
			//
			Backbone.history.navigate('#packages/' + this.options.package.get('package_uuid'), {
				trigger: true
			});
		},

		onClickNext: function() {

			// go to package version contents view
			//
			Backbone.history.navigate('#packages/versions/' + this.model.get('package_version_uuid') + '/source', {
				trigger: true
			});
		}
	});
});
