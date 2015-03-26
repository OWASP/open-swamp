/******************************************************************************\
|                                                                              |
|                               user-personal-events.js                        |
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
	'scripts/utilities/iso8601',
	'scripts/models/users/user',
	'scripts/models/events/user-personal-event',
	'scripts/collections/events/events'
], function($, _, Backbone, Config, Registry, Iso8601, User, UserPersonalEvent, Events) {
	return Events.extend({

		//
		// Backbone attributes
		//

		model: UserPersonalEvent,

		//
		// ajax methods
		//

		fetch: function(options) {
			return this.fetchByUser(Registry.application.session.user, options);
		},

		fetchByUser: function(user, options) {
			return Events.prototype.fetch.call(this, _.extend(options || {}, {
				url: Config.registryServer + '/users/' + user.get('user_uid') + '/events'
			}));
		},	

		//
		// overridden Backbone methods
		//

		parse: function(data) {
			var events = [];
			for (var i = 0; i < data.length; i++) {
				var item = data[i];
				events.push(new UserPersonalEvent({
					'date': Date.parseIso8601(item.event_date),
					'event_type': data[i].event_type,
					'user': new User(item.user)
				}));
			}
			return events;
		}
	});
});