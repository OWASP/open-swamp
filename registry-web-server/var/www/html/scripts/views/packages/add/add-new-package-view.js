/******************************************************************************\
|                                                                              |
|                               add-new-package-view.js                        |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view used to add / upload new packages.              |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/packages/add/add-new-package.tpl',
	'scripts/registry',
	'scripts/models/packages/package',
	'scripts/models/packages/package-version',
	'scripts/collections/packages/package-version-dependencies',
	'scripts/views/packages/new-package-view'
], function($, _, Backbone, Marionette, Template, Registry, Package, PackageVersion, PackageVersionDependencies, NewPackageView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			newPackage: '#new-package'
		},

		//
		// methods
		//

		initialize: function() {
			this.model = new Package({
				'package_sharing_status': 'private'
			});
			this.packageVersion = new PackageVersion({
				'version_string': '1.0',
				'version_sharing_status': 'private'
			});

			this.packageVersionDependencies = new PackageVersionDependencies();
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model
			}));
		},

		onRender: function() {

			// display new package view
			//
			this.newPackage.show(
				new NewPackageView({
					model: this.model,
					packageVersion: this.packageVersion,
					packageVersionDependencies: this.packageVersionDependencies
				})
			);

			// scroll to top
			//
			var el = this.$el.find('h1');
			el[0].scrollIntoView(true);
		}
	});
});
