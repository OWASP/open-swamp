/******************************************************************************\
|                                                                              |
|                          add-new-package-version-view.js                     |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view used to add / upload new package versions.      |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/packages/info/versions/add/add-new-package-version.tpl',
	'scripts/models/utilities/version',
	'scripts/models/packages/package',
	'scripts/models/packages/package-version',
	'scripts/collections/packages/package-versions',
	'scripts/collections/packages/package-version-dependencies',
	'scripts/views/packages/info/versions/new-package-version-view'
], function($, _, Backbone, Marionette, Template, Version, Package, PackageVersion, PackageVersions, PackageVersionDependencies, NewPackageVersionView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			newPackageVersion: '#new-package-version'
		},

		//
		// methods
		//

		initialize: function() {

			// set attributes
			//
			this.packageVersionDependencies = new PackageVersionDependencies();
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				name: this.options.package.get('name'),
				package: this.options.package
			}));
		},

		onRender: function() {
			var self = this;
			this.packageVersionDependencies.fetchMostRecent(this.options.package.get('package_uuid'), {

				// callbacks
				//
				success: function() {

					// get latest package version
					//
					self.options.package.fetchLatestVersion(function(packageVersion) {
						var nextVersionString = Version.getNextVersionString(packageVersion.get('version_string'));

						// create next version
						//
						self.model = new PackageVersion({
							'version_string': nextVersionString,
							'package_uuid': self.options.package.get('package_uuid'),
							'external_url': self.options.package.get('external_url'),
							'version_sharing_status': 'private'
						});

						// display package profile form
						//
						self.newPackageVersion.show(
							new NewPackageVersionView({
								model: self.model,
								package: self.options.package,
								packageVersionDependencies: self.packageVersionDependencies
							})
						);
					});
				}
			});
		}
	});
});
