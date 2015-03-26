/******************************************************************************\
|                                                                              |
|                                new-package-view.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a new package's information.        |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/packages/new-package.tpl',
	'scripts/registry',
	'scripts/views/dialogs/error-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/packages/info/details/new-package-details-view',
	'scripts/views/packages/info/source/new-package-source-view',
	'scripts/views/packages/info/build/new-package-build-view',
	'scripts/views/packages/info/sharing/new-package-sharing-view',
], function($, _, Backbone, Marionette, Template, Registry, ErrorView, NotifyView, NewPackageDetailsView, NewPackageSourceView, NewPackageBuildView, NewPackageSharingView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			newPackageInfo: '#new-package-info'
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

			// show new package details view
			//
			this.newPackageInfo.show(
				new NewPackageDetailsView({
					model: this.model,
					packageVersion: this.options.packageVersion,
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

			// show new package source view
			//
			this.newPackageInfo.show(
				new NewPackageSourceView({
					model: this.model,
					packageVersion: this.options.packageVersion,
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

			// show new package build view
			//
			this.newPackageInfo.show(
				new NewPackageBuildView({
					model: this.model,
					packageVersion: this.options.packageVersion,
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

			// show new package sharing view
			//
			this.newPackageInfo.show(
				new NewPackageSharingView({
					model: this.model,
					packageVersion: this.options.packageVersion,
					packageVersionDependencies: this.options.packageVersionDependencies,
					parent: this
				})
			);
		},

		//
		// utility methods
		//

		save: function(done) {
			var self = this;

			// save package
			//
			this.model.save(undefined, {

				// callbacks
				//
				success: function() {

					// save package version
					//
					self.saveVersion(done);
				}, 

				error: function(jqxhr, textstatus, errorThrown) {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not save package: " + errorThrown.xhr.responseText
						})
					);
				}
			});
		},

		saveVersion: function(done) {
			var self = this;

			// set package version attributes
			//
			this.options.packageVersion.set({
				'package_uuid': this.model.get('package_uuid')
			});

			this.options.packageVersion.store({

				// callbacks
				//
				success: function() {

					// perform callbacks
					//
					if (done) {
						self.savePackageDependencies( done );
					}
				},

				error: function(jqxhr, textstatus, errorThrown) {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not save package version: " + errorThrown.xhr.responseText
						})
					);
				}
			});
		},

		savePackageDependencies: function( done ){
			var self = this;

			// set package version of dependencies
			//
			var vers_uuid = this.options.packageVersion.get('package_version_uuid');
			this.options.packageVersionDependencies.each(function( item  ){ 
				item.set('package_version_uuid', vers_uuid);
			});

			// save dependencies
			//
			this.options.packageVersionDependencies.saveAll({

				// callbacks
				//
				success: function(){
					if (done) {
						done();
					}

					// show success notify view
					//
					Registry.application.modal.show(
						new NotifyView({
							message: "Package " + self.model.get('name') + " version " + self.options.packageVersion.get('version_string') + " has been uploaded successfully.",

							// callbacks
							//
							accept: function() {
								
								// show package
								//
								Backbone.history.navigate('#packages/' + self.model.get('package_uuid'), {
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
