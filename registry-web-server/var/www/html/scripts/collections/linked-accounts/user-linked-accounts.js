/******************************************************************************\
|                                                                              |
|                              user-linked-accounts.js                         |
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
	'scripts/models/linked-accounts/user-linked-account'
], function($, _, Backbone, Config, UserLinkedAccount) {
	return Backbone.Collection.extend({

		//
		// Backbone attributes
		//

		model: UserLinkedAccount,

		//
		// ajax methods
		//

		fetchByUser: function(user, options) {
			return this.fetch(_.extend(options, {
				url: Config.registryServer + '/linked-accounts/user/' + user.get('user_uid')
			}));
		}
	});
});
