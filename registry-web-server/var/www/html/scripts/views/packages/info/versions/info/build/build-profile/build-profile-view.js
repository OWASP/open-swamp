/******************************************************************************\
|                                                                              |
|                               build-profile-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a non-editable form view of a package versions's         |
|        build information.                                                    |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'scripts/collections/platforms/platform-versions',
	'text!templates/packages/info/versions/info/build/build-profile/build-profile.tpl',
	'scripts/views/packages/info/versions/info/build/build-profile/package-dependencies-view',
	'scripts/views/packages/info/versions/info/build/build-profile/package-type/c/c-package-view',
	'scripts/views/packages/info/versions/info/build/build-profile/package-type/java-source/java-source-package-view',
	'scripts/views/packages/info/versions/info/build/build-profile/package-type/java-bytecode/java-bytecode-package-view',
	'scripts/views/packages/info/versions/info/build/build-profile/package-type/python/python-package-view',
	'scripts/views/packages/info/versions/info/build/build-profile/package-type/android-source/android-source-package-view'
], function($, _, Backbone, Marionette, PlatformVersions, Template, PackageDependenciesView, CPackageView, JavaSourcePackageView, JavaBytecodePackageView, PythonPackageView, AndroidSourcePackageView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			packageType: '#package-type',
			packageDependencies: '#package-dependencies'
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
			this.showPackageDependencies();

			// show subviews
			//
			if (this.options.package) {
				this.showPackageType(this.options.package.getPackageType());
			}

			// check build system
			//
			this.checkBuildSystem();
		},

		showPackageDependencies: function(){
			var self = this;
			var platformVersions = new PlatformVersions();
			platformVersions.fetchAll({

				// callbacks
				//
				success: function() {
					self.packageDependencies.show(
						new PackageDependenciesView({
							packageVersionDependencies: self.options.packageVersionDependencies,
							readonly: self.options.readonly,
							platformVersions: platformVersions,
							model: self.model,
							parent: self
						})
					);
				}
			});
		},

		showPackageType: function(packageType) {
			switch (packageType) {
				case 'c-source':
					this.packageType.show(
						new CPackageView({
							model: this.model,
							parent: this
						})
					);
					break;
				case 'java-source':
					this.packageType.show(
						new JavaSourcePackageView({
							model: this.model,
							parent: this
						})
					);
					break;
				case 'java-bytecode':
					this.packageType.show(
						new JavaBytecodePackageView({
							model: this.model,
							parent: this
						})
					);
					break;
				case 'python2':
				case 'python3':
					this.packageType.show(
						new PythonPackageView({
							model: this.model,
							parent: this
						})
					);
					break;
				case 'android-source':
					this.packageType.show(
						new AndroidSourcePackageView({
							model: this.model,
							parent: this
						})
					);
					break;	
			}
		},

		//
		// build system validation methods
		//

		checkBuildSystem: function() {
			var self = this;

			// check build system
			//
			this.model.checkBuildSystem({

				// callbacks
				//
				success: function() {
					self.options.parent.hideWarning();
				},

				error: function(data) {
					self.options.parent.showWarning(data.responseText);
				}
			});
		}
	});
});
