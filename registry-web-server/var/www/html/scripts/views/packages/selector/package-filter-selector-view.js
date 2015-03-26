/******************************************************************************\
|                                                                              |
|                          package-filter-selector-view.js                     |
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
	'scripts/registry',
	'scripts/models/projects/project',
	'scripts/collections/projects/projects',
	'scripts/collections/packages/packages',
	'scripts/collections/packages/package-versions',
	'scripts/views/dialogs/error-view',
	'scripts/views/widgets/selectors/grouped-name-selector-view',
	'scripts/views/widgets/selectors/version-filter-selector-view'
], function($, _, Backbone, Registry, Project, Projects, Packages, PackageVersions, ErrorView, GroupedNameSelectorView, VersionFilterSelectorView) {
	return GroupedNameSelectorView.extend({

		//
		// methods
		//

		initialize: function(attributes, options) {
			var self = this;

			// call superclass method
			//
			GroupedNameSelectorView.prototype.initialize.call(this, options);
			
			// set attributes
			//
			this.collection = new Backbone.Collection();
			this.options = options;

			// fetch packages
			//
			this.fetchPackages(function(publicPackages, protectedPackages) {

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

				// create package lists
				//
				self.collection = new Backbone.Collection([{
					'name': "Any",
					'model': null
				}, {
					'name': "Protected Packages",
					'group': protectedPackages || new Packages()
				}, {
					'name': "Public Packages",
					'group': publicPackages || new Packages()
				}]);
				
				// render
				//
				self.render();

				// show version filter selector
				//
				if (options.versionFilterSelector) {
					self.showVersionFilter(options.versionFilterSelector);
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

						// fetch protected packages for this project
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
										message: "Could not fetch protected packages for this project."
									})
								);						
							}
						});
					} else if (self.options.projects && self.options.projects.length > 0) {
						var protectedPackages = new Packages([]);

						// fetch protected packages for all projects
						//
						protectedPackages.fetchAllProtected(self.options.projects, {

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
										message: "Could not fetch protected packages for all projects."
									})
								);						
							}
						});
					} else {

						// only public packages
						//
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

		fetchPackageVersions: function(package, done) {
			var collection = new PackageVersions([]);

			if (this.options.project) {

				// a single project
				//
				collection.fetchByPackageProject(package, this.options.project, {

					// callbacks
					//
					success: function() {

						// perform callback
						//
						done(collection);
					},

					error: function() {

						// show error dialog
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "Could not fetch package versions."
							})
						);
					}
				});
			} else if (this.options.projects && this.options.projects.length > 0) {

				// multiple projects
				//
				collection.fetchByPackageProjects(package, this.options.projects, {

					// callbacks
					//
					success: function() {

						// perform callback
						//
						done(collection);
					},

					error: function() {

						// show error dialog
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "Could not fetch package versions."
							})
						);
					}
				});
			} else {

				// no project or projects
				//
				done(collection);
			}
		},

		//
		// name querying methods
		//

		getSelectedName: function() {
			if (this.hasSelected()) {
				return this.getSelected().get('name');
			} else {
				return "any package";
			}
		},

		hasSelectedName: function() {
			return (this.getSelected() !== null) && (this.getSelected() != undefined);
		},

		//
		// version querying methods
		//

		hasSelectedVersionString: function() {
			return this.getSelectedVersionString() != undefined;
		},

		getSelectedVersionString: function() {
			if (this.options.versionFilterSelector && this.options.versionFilterSelector.currentView) {
				return this.options.versionFilterSelector.currentView.getSelectedVersionString();
			} else if (this.options.initialVersion) {
				return VersionFilterSelectorView.getVersionString(this.options.initialVersion);
			}
		},

		//
		// name and version querying methods
		//

		getDescription: function() {
			if (this.hasSelectedName()) {

				// return name and version
				//
				var description =  this.getSelectedName();
				if (this.hasSelectedVersionString()) {
					if (description) {
						description += " ";
					}
					description += this.getSelectedVersionString();
				}
				return description;
			} else {

				// return name only
				//
				return this.getSelectedName();
			}
		},

		//
		// rendering methods
		//

		showVersionFilter: function(versionFilterSelector, done) {
			var self = this;
			var selectedPackage = this.getSelected();
			
			if (selectedPackage) {
				this.fetchPackageVersions(selectedPackage, function(collection) {

					// show version filter selector view
					//
					versionFilterSelector.show(
						new VersionFilterSelectorView({
							collection: collection,
							initialValue: self.options.initialVersion,
							defaultOptions: self.options.versionDefaultOptions,
							selectedOptions: self.options.versionSelectedOptions,

							// callbacks
							//
							onChange: self.options.onChange
						})
					);

					// perform callback
					//
					if (done) {
						done();
					}
				});

				// show version filter label
				//
				if (this.options.versionFilterLabel) {
					this.options.versionFilterLabel.show();
				}
			} else {

				// hide version filter selector view
				//
				versionFilterSelector.reset();

				// hide version filter label
				//
				if (this.options.versionFilterLabel) {
					this.options.versionFilterLabel.hide();
				}

				// perform callback
				//
				if (done) {
					done();
				}
			}
		},

		//
		// event handling methods
		//

		onChange: function() {
			var self = this;

			// update selected
			//
			this.selected = this.getItemByIndex(this.getSelectedIndex());
			
			// update version selector
			//
			if (this.options.versionFilterSelector) {
				this.showVersionFilter(this.options.versionFilterSelector, function() {

					// call on change callback
					//
					if (self.options.onChange) {
						self.options.onChange();
					}				
				});
			} else {
				
				// call on change callback
				//
				if (this.options.onChange) {
					this.options.onChange();
				}
			}
		}
	});
});
