/******************************************************************************\
|                                                                              |
|                                   user-events.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of user events related to users.       |
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
	'scripts/models/users/user',
	'scripts/models/events/user-event',
	'scripts/collections/events/events'
], function($, _, Backbone, Config, Registry, User, UserEvent, Events) {
	return Events.extend({

		//
		// Backbone attributes
		//

		model: UserEvent
	}, {

		//
		// static methods
		//

		fetchNumAll: function(options) {
			return this.fetchNumAllByUser(Registry.application.session.user, options);
		},

		fetchNumAllByUser: function(user, options) {
			return $.ajax(Config.registryServer + '/users/' + user.get('user_uid') + '/events/all/num', options);
		}
	});
});