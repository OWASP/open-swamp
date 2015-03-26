/******************************************************************************\
|                                                                              |
|                                    packages.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of packages.                           |
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
	'scripts/models/packages/package',
	'scripts/collections/utilities/named-items'
], function($, _, Backbone, Config, Registry, Package, NamedItems) {
	return NamedItems.extend({

		//
		// Backbone attributes
		//

		model: Package,
		url: Config.csaServer + '/packages/public',

		//
		// filtering methods
		//

		getPublic: function() {
			return this.getByAttribute('package_sharing_status', 'public');
		},

		getPrivate: function() {
			return this.getByAttribute('package_sharing_status', 'private');
		},

		getProtected: function() {
			return this.getByAttribute('package_sharing_status', 'protected');
		},

		getNonPublic: function() {
			return this.getByNotAttribute('package_sharing_status', 'public');
		},

		getPlatformDependent: function() {
			var collection = this.clone();

			collection.reset();
			this.each(function(item) {
				if (!item.isPlatformIndependent()) {
					collection.add(item);
				}
			});

			return collection;
		},

		getPlatformIndependent: function() {
			var collection = this.clone();

			collection.reset();
			this.each(function(item) {
				if (item.isPlatformIndependent()) {
					collection.add(item);
				}
			});

			return collection;
		},

		//
		// ajax methods
		//

		fetch: function(options) {
			return this.fetchByUser(Registry.application.session.user, options);
		},

		fetchTypes: function(options) {
			return NamedItems.prototype.fetch.call(this, _.extend(options, {
				url: Config.csaServer + '/packages/types'
			}));
		},

		fetchByUser: function(user, options) {
			return NamedItems.prototype.fetch.call(this, _.extend(options, {
				url: Config.csaServer + '/packages/users/' + user.get('user_uid')
			}));
		},

		fetchAll: function(options) {
			return NamedItems.prototype.fetch.call(this, _.extend(options, {
				url: Config.csaServer + '/packages/all/'
			}));
		},

		fetchPublic: function(options) {
			return NamedItems.prototype.fetch.call(this, _.extend(options, {
				url: Config.csaServer + '/packages/public'
			}));
		},

		fetchProtected: function(project, options) {
			return NamedItems.prototype.fetch.call(this, _.extend(options, {
				url: Config.csaServer + '/packages/protected/' + project.get('project_uid')
			}));
		},

		fetchAllProtected: function(projects, options) {
			return NamedItems.prototype.fetch.call(this, _.extend(options, {
				url: Config.csaServer + '/packages/protected/' + projects.getUuidsStr()
			}));
		},

		fetchAvailableToMe: function(options) {
			return NamedItems.prototype.fetch.call(this, _.extend(options, {
				url: Config.csaServer + '/packages/available'
			}));
		},

		fetchByProject: function(project, options) {
			return NamedItems.prototype.fetch.call(this, _.extend(options, {
				url: Config.csaServer + '/packages/projects/' + project.get('project_uid')
			}));
		}
	}, {

		//
		// static methods
		//

		fetchNumByUser: function(user, options) {
			return $.ajax(Config.csaServer + '/packages/users/' + user.get('user_uid') + '/num', options);
		},

		fetchNumProtected: function(project, options) {
			return $.ajax(Config.csaServer + '/packages/protected/' + project.get('project_uid') + '/num', options);
		},

		fetchNumAllProtected: function(projects, options) {
			return $.ajax(Config.csaServer + '/packages/protected/' + projects.getUuidsStr() + '/num', options);
		},
	});
});
