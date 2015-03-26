/******************************************************************************\
|                                                                              |
|                              user-permissions.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of user permissions.                   |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config',
	'scripts/models/permissions/user-permission'
], function($, _, Backbone, Config, UserPermission) {
	return Backbone.Collection.extend({

		//
		// Backbone attributes
		//

		model: UserPermission,

		//
		// ajax methods
		//

		fetchByUser: function(user, options) {
			return this.fetch(_.extend(options, {
				url: Config.registryServer + '/users/' + user.get('user_uid') + '/permissions'
			}));
		}
	});
});
