/******************************************************************************\
|                                                                              |
|                                     tools.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of software assessment tools.          |
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
	'scripts/models/tools/tool',
	'scripts/collections/utilities/named-items'
], function($, _, Backbone, Config, Registry, Tool, NamedItems) {
	var Class = NamedItems.extend({

		//
		// Backbone attributes
		//

		model: Tool,
		url: Config.csaServer + '/tools',

		//
		// filtering methods
		//

		getPublic: function() {
			return this.getByAttribute('tool_sharing_status', 'public');
		},

		getPrivate: function() {
			return this.getByAttribute('tool_sharing_status', 'private');
		},

		getProtected: function() {
			return this.getByAttribute('tool_sharing_status', 'protected');
		},

		getNonPublic: function() {
			return this.getByNotAttribute('tool_sharing_status', 'public');
		},

		//
		// ajax methods
		//

		fetch: function(options) {
			return this.fetchByUser(Registry.application.session.user, options);
		},

		fetchByUser: function(user, options) {
			return NamedItems.prototype.fetch.call(this, _.extend(options, {
				url: Config.csaServer + '/tools/users/' + user.get('user_uid')
			}));
		},

		fetchAll: function(options) {
			return NamedItems.prototype.fetch.call(this, _.extend(options, {
				url: Config.csaServer + '/tools/all/'
			}));
		},

		fetchPublic: function(options) {
			return NamedItems.prototype.fetch.call(this, _.extend(options, {
				url: Config.csaServer + '/tools/public'
			}));
		},

		fetchProtected: function(project, options) {
			return NamedItems.prototype.fetch.call(this, _.extend(options, {
				url: Config.csaServer + '/tools/protected/' + project.get('project_uid')
			}));
		},

		fetchByProject: function(project, options) {
			return NamedItems.prototype.fetch.call(this, _.extend(options, {
				url: Config.csaServer + '/tools/projects/' + project.get('project_uid')
			}));
		}
	});

	return Class;
});
