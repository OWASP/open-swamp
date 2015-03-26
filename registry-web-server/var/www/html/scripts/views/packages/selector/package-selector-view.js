/******************************************************************************\
|                                                                              |
|                             package-selector-view.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for selecting a software package from a list.     |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'select2',
	'scripts/registry',
	'scripts/collections/packages/packages',
	'scripts/collections/packages/package-versions',
	'scripts/views/dialogs/error-view',
	'scripts/views/widgets/selectors/grouped-name-selector-view',
	'scripts/views/widgets/selectors/version-selector-view'
], function($, _, Backbone, Select2, Registry, Packages, PackageVersions, ErrorView, GroupedNameSelectorView, VersionSelectorView) {
	return GroupedNameSelectorView.extend({

		//
		// methods
		//

		initialize: function(attributes, options) {
			var self = this;

			// set attributes
			//
			this.collection = new Backbone.Collection();
			this.options = options;
			this.selected = this.options.initialValue;

			// fetch packages
			//
			this.fetchPackages(function(publicPackages, protectedPackages) {
				
				// don't show platform independent packages
				//
				if (self.options.showPlatformDependent) {
					publicPackages = publicPackages.getPlatformDependent();
					protectedPackages = protectedPackages.getPlatformDependent();
				}

				// distinguish repeated names
				//
				var namesCount = {};
				if (publicPackages) {
					publicPackages.distinguishRepeatedNames(namesCount);
				}
				if (protectedPackages) {
					protectedPackages.distinguishRepeatedNames(namesCount);
				}

				// sort by name
				//
				if (publicPackages) {
					publicPackages.sort();
				}
				if (protectedPackages) {
					protectedPackages.sort();
				}

				// set attributes
				//
				self.collection = new Backbone.Collection([{
					'name': ''
				}, {
					'name': 'Protected Packages',
					'group': protectedPackages || new Packages()
				}, {
					'name': 'Public Packages',
					'group': publicPackages || new Packages()
				}]);
				
				// render
				//
				self.render();

				// show version selector
				//
				if (options.versionSelector) {
					self.showVersion(options.versionSelector);
				}
			});
		},

		//
		// ajax methods
		//

		fetchPackages: function(success) {
			var self = this;
			var publicPackages = new Packages([]);

			// fetch public packages
			//
			publicPackages.fetchPublic({

				// callbacks
				//
				success: function() {
					if (self.options.project) {
						var protectedPackages = new Packages([]);

						// fetch protected packages
						//		
						protectedPackages.fetchProtected(self.options.project, {

							// callbacks
							//
							success: function() {
								success(publicPackages, protectedPackages);
							},

							error: function() {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Could not fetch protected packages."
									})
								);						
							}
						});
					} else {
						success(publicPackages);
					}
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch public packages."
						})
					);
				}
			});
		},

		//
		// querying methods
		//

		getSelectedName: function() {
			var selected = this.getSelected();
			if (selected) {
				return selected.get('name')
			} else {
				return undefined;
			}
		},

		//
		// rendering methods
		//

		showVersion: function(versionSelector) {
			var self = this;
			var selectedPackage = this.getSelected();

			if (typeof selectedPackage == 'undefined') {

				// only latest version available
				//
				var collection = new PackageVersions([{
					version_string: 'Latest'
				}]);

				// show version selector view
				//
				versionSelector.show(
					new VersionSelectorView({
						collection: collection,
						parentSelector: self,

						// callbacks
						//
						onChange: self.options.onChange
					})
				);
			} else {

				// fetch package versions
				//
				var collection = new PackageVersions([]);
				collection.fetchByPackageProject(selectedPackage, self.options.project, {

					// callbacks
					//
					success: function() {

						// sort by version string
						//
						collection.sort({
							reverse: true
						});

						// add latest option
						//
						collection.add({
							version_string: 'Latest'
						}, {
							at: 0
						});

						// show version selector view
						//
						versionSelector.show(
							new VersionSelectorView({
								collection: collection,
								parentSelector: self,
								initialValue: self.options.initialVersion,

								// callbacks
								//
								onChange: self.options.onChange
							})
						);
					},

					error: function() {

						// show error dialog
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "Could not fetch collection of package versions."
							})
						);
					}
				});
			}
		},

		//
		// event handling methods
		//

		onChange: function() {

			// update selected
			//
			this.selected = this.getItemByIndex(this.getSelectedIndex());

			// update version selector
			//
			if (this.options.versionSelector) {
				this.showVersion(this.options.versionSelector);
			}

			// call on change callback
			//
			if (this.options.onChange) {
				this.options.onChange();
			}
		}
	});
});
