/******************************************************************************\
|                                                                              |
|                                package-versions.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of package versions.                   |                                                  |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config',
	'scripts/models/packages/package-version',
	'scripts/collections/utilities/versions'
], function($, _, Backbone, Config, PackageVersion, Versions) {
	return Versions.extend({

		//
		// Backbone attributes
		//

		model: PackageVersion,

		//
		// ajax methods
		//

		fetchByPackage: function(package, options) {
			return this.fetch(_.extend(options, {
				url: Config.csaServer + '/packages/' + package.get('package_uuid') + '/versions'
			}));
		},

		fetchAvailableByPackage: function(package, options) {
			return this.fetch(_.extend(options, {
				url: Config.csaServer + '/packages/' + package.get('package_uuid') + '/versions/available'
			}));
		},

		fetchByPackageProject: function(package, project, options) {
			return this.fetch(_.extend(options, {
				url: Config.csaServer + '/packages/' + package.get('package_uuid') + '/' + project.get('project_uid') + '/versions'
			}));
		},

		fetchByPackageProjects: function(package, projects, options) {
			return this.fetch(_.extend(options, {
				url: Config.csaServer + '/packages/' + package.get('package_uuid') + '/' + projects.getUuidsStr() + '/versions'
			}));
		}
	});
});
