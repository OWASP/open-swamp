/******************************************************************************\
|                                                                              |
|                       edit-package-version-details-view.js                   |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for editing a package versions's details.       |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/packages/info/versions/info/details/edit-package-version-details.tpl',
	'scripts/registry',
	'scripts/views/dialogs/error-view',
	'scripts/views/packages/info/versions/info/details/package-version-profile/package-version-profile-form-view'
], function($, _, Backbone, Marionette, Template, Registry, ErrorView, PackageVersionProfileFormView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			packageVersionProfileForm: '#package-version-profile-form'
		},

		events: {
			'click #save': 'onClickSave',
			'click #cancel': 'onClickCancel'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.options.model,
				package: this.options.package
			}));
		},

		onRender: function() {

			// display package version profile form view
			//
			this.packageVersionProfileForm.show(
				new PackageVersionProfileFormView({
					model: this.model
				})
			);
		},

		//
		// event handling methods
		//

		onClickSave: function() {
			var self = this;

			// check validation
			//
			if (this.packageVersionProfileForm.currentView.isValid()) {

				// update model
				//
				this.packageVersionProfileForm.currentView.update(this.model);

				// save changes
				//
				this.model.save(undefined, {

					// callbacks
					//
					success: function() {

						// return to package version view
						//
						Backbone.history.navigate('#packages/versions/' + self.model.get('package_version_uuid'), {
							trigger: true
						});
					},

					error: function() {

						// show error dialog
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "Could not save package version changes."
							})
						);
					}
				});
			}
		},

		onClickCancel: function() {
			Backbone.history.navigate('#packages/versions/' + this.model.get('package_version_uuid'), {
				trigger: true
			});
		}
	});
});