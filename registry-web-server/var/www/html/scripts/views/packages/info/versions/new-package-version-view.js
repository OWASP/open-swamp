/******************************************************************************\
|                                                                              |
|                           new-package-version-view.js                        |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a package version's information.    |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/packages/info/versions/new-package-version.tpl',
	'scripts/registry',
	'scripts/views/dialogs/error-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/packages/info/versions/info/details/new-package-version-details-view',
	'scripts/views/packages/info/versions/info/source/new-package-version-source-view',
	'scripts/views/packages/info/versions/info/build/new-package-version-build-view',
	'scripts/views/packages/info/versions/info/sharing/new-package-version-sharing-view'
], function($, _, Backbone, Marionette, Template, Registry, ErrorView, NotifyView, NewPackageVersionDetailsView, NewPackageVersionSourceView, NewPackageVersionBuildView, NewPackageVersionSharingView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			newPackageVersionInfo: '#new-package-version-info'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template);
		},

		onRender: function() {

			// show details
			//
			this.showDetails();
		},

		showDetails: function() {

			// update top navigation
			//
			this.$el.find('.nav li').removeClass('active');
			this.$el.find('.nav li#details').addClass('active');

			// show new package version details view
			//
			this.newPackageVersionInfo.show(
				new NewPackageVersionDetailsView({
					model: this.model,
					package: this.options.package,
					packageVersionDependencies: this.options.packageVersionDependencies,
					parent: this
				})
			);
		},

		showSource: function() {

			// update top navigation
			//
			this.$el.find('.nav li').removeClass('active');
			this.$el.find('.nav li#source').addClass('active');

			// show new package version details view
			//
			this.newPackageVersionInfo.show(
				new NewPackageVersionSourceView({
					model: this.model,
					package: this.options.package,
					packageVersionDependencies: this.options.packageVersionDependencies,
					parent: this
				})
			);
		},

		showBuild: function() {

			// update top navigation
			//
			this.$el.find('.nav li').removeClass('active');
			this.$el.find('.nav li#build').addClass('active');

			// show new package version build info view
			//
			this.newPackageVersionInfo.show(
				new NewPackageVersionBuildView({
					model: this.model,
					package: this.options.package,
					packageVersionDependencies: this.options.packageVersionDependencies,
					parent: this
				})
			);
		},

		showSharing: function() {

			// update top navigation
			//
			this.$el.find('.nav li').removeClass('active');
			this.$el.find('.nav li#sharing').addClass('active');

			// show new package version build info view
			//
			this.newPackageVersionInfo.show(
				new NewPackageVersionSharingView({
					model: this.model,
					package: this.options.package,
					packageVersionDependencies: this.options.packageVersionDependencies,
					user: Registry.application.session.user,
					parent: this
				})
			);
		},

		showWarning: function(message) {
			this.$el.find('.alert-error .message').html(message);
			this.$el.find('.alert-error').show();
		},

		hideWarning: function() {
			this.$el.find('.alert-error').hide();
		},

		//
		// utility methods
		//

		save: function(done) {
			var self = this;

			// set package version attributes
			//
			this.model.set({
				'package_uuid': this.options.package.get('package_uuid')
			});

			this.model.save(undefined, {

				// callbacks
				//
				success: function() {
					self.model.add({
						data: {
							'package_path': self.model.get('package_path')
						},

						// callbacks
						//
						success: function() {

							self.savePackageDependencies( done );

						},

						error: function(response) {

							// show error dialog
							//
							Registry.application.modal.show(
								new ErrorView({
									message: response.responseText
								})
							);
						}
					});
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not save package version."
						})
					);
				}
			});
		},

		savePackageDependencies: function(done) {
			var self = this;
			var vers_uuid = self.model.get('package_version_uuid');
			this.options.packageVersionDependencies.each(function( item  ){ 
				item.set('package_version_uuid', vers_uuid);
			});

			this.options.packageVersionDependencies.saveAll({

				success: function(){
			
					// call optional callback
					//
					if (done) {
						done();
					}

					// show success notify view
					//
					Registry.application.modal.show(
						new NotifyView({
							message: "Package " + self.options.package.get('name') + " version " + self.model.get('version_string') + " has been uploaded successfully.",

							// callbacks
							//
							accept: function() {
								
								// show package
								//
								Backbone.history.navigate('#packages/' + self.options.package.get('package_uuid'), {
									trigger: true
								});
							}
						})
					);
				}
			});

		}

	});
});
