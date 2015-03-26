/******************************************************************************\
|                                                                              |
|                        edit-package-version-source-view.js                   |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for editing a package versions's source         |
|        information.                                                          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'clickover',
	'text!templates/packages/info/versions/info/source/edit-package-version-source.tpl',
	'scripts/registry',
	'scripts/views/dialogs/error-view',
	'scripts/views/packages/info/versions/info/source/source-profile/package-version-source-profile-form-view',
	'scripts/views/packages/info/versions/info/source/dialogs/package-version-file-types-view'
], function($, _, Backbone, Marionette, Clickover, Template, Registry, ErrorView, PackageVersionSourceProfileFormView, PackageVersionFileTypesView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			packageVersionSourceProfileForm: '#package-version-source-profile-form'
		},

		events: {
			'click #save': 'onClickSave',
			'click #show-file-types': 'onClickShowFileTypes',
			'click #cancel': 'onClickCancel'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model,
				package: this.options.package
			}));
		},

		onRender: function() {

			// show profile
			//
			this.packageVersionSourceProfileForm.show(
				new PackageVersionSourceProfileFormView({
					model: this.model,
					package: this.options.package
				})
			);
		},

		//
		// event handling methods
		//

		onClickPrev: function() {

			// show next prev view
			//
			this.options.parent.showDetails();
		},
		
		onClickSave: function() {
			var self = this;

			// check validation
			//
			if (this.packageVersionSourceProfileForm.currentView.isValid()) {

				// update model
				//
				this.packageVersionSourceProfileForm.currentView.update(this.model);

				// save changes
				//
				this.model.save(undefined, {

					// callbacks
					//
					success: function() {

						// return to package version source view
						//
						Backbone.history.navigate('#packages/versions/' + self.model.get('package_version_uuid') + '/source', {
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

		onClickShowFileTypes: function() {

			// show package version file types dialog
			//
			Registry.application.modal.show(
				new PackageVersionFileTypesView({
					model: this.model,
					packagePath: this.packageVersionSourceProfileForm.currentView.getPackagePath()
				})
			);
		},

		onClickCancel: function() {

			// go to package view
			//
			Backbone.history.navigate('#packages/versions/' + this.model.get('package_version_uuid') + '/source', {
				trigger: true
			});
		}
	});
});