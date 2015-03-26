/******************************************************************************\
|                                                                              |
|                                 package-router.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the url routing that's used for package routes.          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/models/projects/project',
	'scripts/collections/projects/projects'
], function($, _, Backbone, Project, Projects) {

	//
	// query string methods
	//
	
	function parseProjectQueryString(queryString, project) {

		// parse query string
		//
		var data = queryStringToData(queryString);

		// create project from query string data
		//
		if (data['project'] == 'none') {

			// use the default 'trial' project
			//
			data['project']	= project;	
		} else if (data['project'] == 'any' || !data['project']) {

			// use all projects
			//
			data['project'] = undefined;
			data['projects'] = new Projects();
		} else {

			// use a particular specified package
			//
			data['project'] = new Project({
				project_uid: data['project']
			});
		}

		return data;
	}

	function parseQueryString(queryString, project) {

		// parse query string
		//
		var data = parseProjectQueryString(queryString, project);

		// parse limit
		//
		if (data['limit']) {
			if (data['limit'] != 'none') {
				data['limit'] = parseInt(data['limit']);
			} else {
				data['limit'] = null;
			}
		}

		return data;
	}

	function fetchQueryStringData(data, done) {

		// fetch models
		//
		$.when(
			data['project']? data['project'].fetch() : true,
			data['projects']? data['projects'].fetch() : true
		).then(function() {

			// perform callback
			//
			done(data);	
		});
	}

	// create router
	//
	return Backbone.Router.extend({

		//
		// route definitions
		//

		routes: {

			// packages routes
			//
			'packages(?*query_string)': 'showPackages',
			'packages/public(?*query_string)': 'showPublicPackages',
			'packages/add': 'showAddNewPackage',

			// package administration routes
			//
			'packages/review(?*query_string)': 'showReviewPackages',

			// package routes
			//
			'packages/:package_uuid': 'showPackage',
			'packages/:package_uuid/edit': 'showEditPackage',
			'packages/:package_uuid/versions/add': 'showAddNewPackageVersion',

			// package version routes
			//
			'packages/versions/:package_version_uuid': 'showPackageVersion',
			'packages/versions/:package_version_uuid/edit': 'showEditPackageVersion',
			'packages/versions/:package_version_uuid/source': 'showPackageVersionSource',
			'packages/versions/:package_version_uuid/source/edit': 'showEditPackageVersionSource',
			'packages/versions/:package_version_uuid/build': 'showPackageVersionBuild',
			'packages/versions/:package_version_uuid/build/edit': 'showEditPackageVersionBuild',
			'packages/versions/:package_version_uuid/sharing': 'showPackageVersionSharing'
		},

		//
		// packages route handlers
		//

		showPackages: function(queryString) {
			require([
				'scripts/registry',
				'scripts/utilities/query-strings',
				'scripts/utilities/url-strings',
				'scripts/views/packages/packages-view'
			], function (Registry, QueryStrings, UrlStrings, PackagesView) {

				// show content view
				//
				Registry.application.showContent({
					nav1: 'home',
					nav2: 'packages', 

					// callbacks
					//
					done: function(view) {

						// parse and fetch query string data
						//
						fetchQueryStringData(parseQueryString(queryString, view.model), function(data) {
							
							// show packages view
							//
							view.content.show(
								new PackagesView({
									model: view.model,
									data: data
								})
							)				
						});
					}
				});
			});
		},

		showPublicPackages: function(queryString) {
			require([
				'scripts/registry',
				'scripts/utilities/query-strings',
				'scripts/utilities/url-strings',
				'scripts/views/packages/public-packages-view'
			], function (Registry, QueryStrings, UrlStrings, PublicPackagesView) {

				// show public packages view
				//
				Registry.application.showMain(
					new PublicPackagesView({
						data: parseQueryString(queryString)
					}), {
						nav: 'resources'
					}
				);
			});
		},

		showAddNewPackage: function() {
			require([
				'scripts/registry',
				'scripts/views/packages/add/add-new-package-view'
			], function (Registry, AddNewPackageView) {

				// show content view
				//
				Registry.application.showContent({
					nav1: 'home',
					nav2: 'packages', 

					// callbacks
					//
					done: function(view) {

						// show add new package view
						//
						view.content.show(
							new AddNewPackageView()
						);
					}
				});
			});
		},

		//
		// package administration route handlers
		//

		showReviewPackages: function(queryString) {
			require([
				'scripts/registry',
				'scripts/utilities/query-strings',
				'scripts/utilities/url-strings',
				'scripts/views/packages/review/review-packages-view',
			], function (Registry, QueryStrings, UrlStrings, ReviewPackagesView) {

				// show content view
				//
				Registry.application.showContent({
					'nav1': 'home',
					'nav2': 'overview', 

					// callbacks
					//
					done: function(view) {

						// show review packages view
						//
						view.content.show(
							new ReviewPackagesView({
								data: parseQueryString(queryString, view.model)
							})
						);
					}
				});
			});
		},

		//
		// package route helper functions
		//

		showPackageView: function(packageUuid, options) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/models/packages/package',
				'scripts/views/dialogs/error-view',
				'scripts/views/packages/package-view'
			], function (Registry, Package, ErrorView, PackageView) {
				Package.fetch(packageUuid, function(package) {

					// check if user is logged in
					//
					if (Registry.application.session.user) {

						// show content view
						//
						Registry.application.showContent({
							nav1: package.isOwned()? 'home' : 'resources',
							nav2: package.isOwned()? 'packages' : undefined, 

							// callbacks
							//	
							done: function(view) {
								view.content.show(
									new PackageView({
										model: package,
										nav: options.nav,
										parent: view
									})
								);

								if (options.done) {
									options.done(view.content.currentView);
								}				
							}					
						});
					} else {

						// show single column package view
						//
						Registry.application.showMain(
							new PackageView({
								model: package,
								nav: options.nav
							}), {
							done: options.done
						});
					}
				});
			});
		},

		//
		// package route handlers
		//

		showPackage: function(packageUuid) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/views/packages/info/details/package-details-view'
			], function (Registry, PackageDetailsView) {

				// show package view
				//
				self.showPackageView(packageUuid, {
					nav: 'details', 

					// callbacks
					//
					done: function(view) {

						// show package details view
						//
						view.packageInfo.show(
							new PackageDetailsView({
								model: view.model
							})
						);
					}
				});
			});
		},

		showEditPackage: function(packageUuid) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/views/packages/info/details/edit-package-details-view',
			], function (Registry, EditPackageDetailsView) {

				// show package view
				//
				self.showPackageView(packageUuid, {
					nav: 'details', 

					// callbacks
					//
					done: function(view) {

						// show edit package details view
						//
						view.options.parent.content.show(
							new EditPackageDetailsView({
								model: view.model
							})
						);
					}
				});
			});
		},

		showAddNewPackageVersion: function(packageUuid) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/views/packages/info/versions/add/add-new-package-version-view'
			], function (Registry, AddNewPackageVersionView) {

				// show package view
				//
				self.showPackageView(packageUuid, {
					nav: 'details', 

					// callbacks
					//
					done: function(view) {

						// show add new package version view
						//
						view.options.parent.content.show(
							new AddNewPackageVersionView({
								package: view.model
							})
						);
					}
				});
			});
		},

		//
		// package version route helper functions
		//

		showPackageVersionView: function(packageVersionUuid, options) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/models/packages/package',
				'scripts/models/packages/package-version',
				'scripts/views/dialogs/error-view',
				'scripts/views/packages/info/versions/package-version-view'
			], function (Registry, Package, PackageVersion, ErrorView, PackageVersionView) {
				PackageVersion.fetch(packageVersionUuid, function(packageVersion) {
					Package.fetch(packageVersion.get('package_uuid'), function(package) {

						// check if user is logged in
						//
						if (Registry.application.session.user) {

							// show content view
							//
							Registry.application.showContent({
								nav1: package.isOwned()? 'home' : 'resources',
								nav2: package.isOwned()? 'packages' : undefined, 

								// callbacks
								//	
								done: function(view) {
									view.content.show(
										new PackageVersionView({
											model: packageVersion,
											package: package,
											nav: options.nav,
											parent: view
										})
									);

									if (options.done) {
										options.done(view.content.currentView);
									}				
								}					
							});
						} else {

							// show single column package version view
							//
							Registry.application.showMain(
								new PackageVersionView({
									model: packageVersion,
									package: package,
									nav: options.nav
								}), {
								done: options.done
							});
						}
					});
				});
			});
		},

		//
		// package version route handlers
		//

		showPackageVersion: function(packageVersionUuid) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/views/packages/info/versions/info/details/package-version-details-view'
			], function (Registry, PackageVersionDetailsView) {

				// show package version view
				//
				self.showPackageVersionView(packageVersionUuid, {
					nav: 'details',

					// callbacks
					// 
					done: function(view) {

						// show package version details view
						//
						view.packageVersionInfo.show(
							new PackageVersionDetailsView({
								model: view.model,
								package: view.options.package
							})
						);
					}
				});
			});
		},

		showEditPackageVersion: function(packageVersionUuid) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/views/packages/info/versions/info/details/edit-package-version-details-view'
			], function (Registry, EditPackageVersionDetailsView) {

				// show package version view
				//
				self.showPackageVersionView(packageVersionUuid, {
					nav: 'details', 

					// callbacks
					//
					done: function(view) {

						// show edit package version details view
						//
						view.options.parent.content.show(
							new EditPackageVersionDetailsView({
								model: view.model,
								package: view.options.package
							})
						);
					}
				});
			});
		},

		showPackageVersionSource: function(packageVersionUuid) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/views/packages/info/versions/info/source/package-version-source-view',
			], function (Registry, PackageVersionSourceView) {

				// show package version view
				//
				self.showPackageVersionView(packageVersionUuid, {
					nav: 'source', 

					// callbacks
					//
					done: function(view) {

						// show package version source view
						//
						view.packageVersionInfo.show(
							new PackageVersionSourceView({
								model: view.model,
								package: view.options.package
							})
						);
					}
				});
			});
		},

		showEditPackageVersionSource: function(packageVersionUuid) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/views/packages/info/versions/info/source/edit-package-version-source-view',
			], function (Registry, EditPackageVersionSourceView) {

				// show package version view
				//
				self.showPackageVersionView(packageVersionUuid, {
					nav: 'source',

					// callbacks
					// 
					done: function(view) {

						// show edit package version source view
						//
						view.options.parent.content.show(
							new EditPackageVersionSourceView({
								model: view.model,
								package: view.options.package
							})
						);
					}
				});
			});
		},

		showPackageVersionBuild: function(packageVersionUuid) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/views/packages/info/versions/info/build/package-version-build-view',
			], function (Registry, PackageVersionBuildView) {

				// show package version view
				//
				self.showPackageVersionView(packageVersionUuid, {
					nav: 'build',

					// callbacks
					// 
					done: function(view) {

						// show package version build view
						//
						view.packageVersionInfo.show(
							new PackageVersionBuildView({
								model: view.model,
								package: view.options.package
							})
						);
					}
				});
			});
		},

		showEditPackageVersionBuild: function(packageVersionUuid) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/views/packages/info/versions/info/build/edit-package-version-build-view',
			], function (Registry, EditPackageVersionBuildView) {

				// show package version view
				//
				self.showPackageVersionView(packageVersionUuid, {
					nav: 'build', 

					// callbacks
					//
					done: function(view) {

						// show edit package version build view
						//
						view.options.parent.content.show(
							new EditPackageVersionBuildView({
								model: view.model,
								package: view.options.package
							})
						);
					}
				});
			});
		},

		showPackageVersionSharing: function(packageVersionUuid) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/views/packages/info/versions/info/sharing/package-version-sharing-view',
			], function (Registry, PackageVersionSharingView) {

				// show package version view
				//
				self.showPackageVersionView(packageVersionUuid, {
					nav: 'sharing',

					// callbacks
					// 
					done: function(view) {

						// show package version sharing view
						//
						view.packageVersionInfo.show(
							new PackageVersionSharingView({
								model: view.model,
								package: view.options.package
							})
						);
					}
				});
			});
		}
	});
});


