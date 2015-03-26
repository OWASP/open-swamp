/******************************************************************************\
|                                                                              |
|                      package-version-dependencies.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|    This file defines a collection of package versions dependencies.          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config',
	'scripts/registry',
	'scripts/models/packages/package-version-dependency'
], function($, _, Backbone, Config, Registry, PackageVersionDependency) {
	return Backbone.Collection.extend({

		//
		// Backbone attributes
		//

		model: PackageVersionDependency,

		//
		// overridden Backbone methods
		//

		url: function() {
			return Config.csaServer + '/packages/versions/dependencies';
		},

		//
		// ajax methods
		//

		fetchByPackageVersion: function( packageVersionUuid, config ){
			return this.fetch(_.extend( config, {
				type: 'GET',
				url: this.url() + '/' + packageVersionUuid
			}));
		},
		
		fetchMostRecent: function( packageUuid, config ){
			return this.fetch(_.extend( config, {
				type: 'GET',
				url: this.url() + '/recent/' + packageUuid
			}));
		},

		saveAll: function( config ){
			return this.fetch(_.extend( config, {
				type: 'POST',
				data: { data: this.toJSON() }
			}));
		},

		updateAll: function( config ){
			return this.fetch(_.extend( config, {
				type: 'PUT',
				data: { data: this.toJSON() }
			}));
		}
	});
});
