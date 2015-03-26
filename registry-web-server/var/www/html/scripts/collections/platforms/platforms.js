/******************************************************************************\
|                                                                              |
|                                   platforms.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of virtual machine platforms.          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config',
	'scripts/models/platforms/platform',
	'scripts/collections/utilities/named-items'
], function($, _, Backbone, Config, Platform, NamedItems) {
	return NamedItems.extend({

		//
		// Backbone attributes
		//

		model: Platform,
		url: Config.csaServer + '/platforms',

		//
		// ajax methods
		//

		fetch: function(options) {
			return this.fetchByUser(Registry.application.session.user, options);
		},

		fetchByUser: function(user, options) {
			return NamedItems.prototype.fetch.call(this, _.extend(options, {
				url: Config.csaServer + '/platforms/users/' + user.get('user_uid')
			}));
		},

		fetchAll: function(options) {
			return NamedItems.prototype.fetch.call(this, _.extend(options, {
				url: Config.csaServer + '/platforms/all/'
			}));
		},

		fetchPublic: function(options) {
			return NamedItems.prototype.fetch.call(this, _.extend(options, {
				url: Config.csaServer + '/platforms/public'
			}));
		},

		fetchProtected: function(project, options) {
			return NamedItems.prototype.fetch.call(this, _.extend(options, {
				url: Config.csaServer + '/platforms/protected/' + project.get('project_uid')
			}));
		},

		fetchByProject: function(project, options) {
			return NamedItems.prototype.fetch.call(this, _.extend(options, {
				url: Config.csaServer + '/platforms/projects/' + project.get('project_uid')
			}));
		}
	});
});