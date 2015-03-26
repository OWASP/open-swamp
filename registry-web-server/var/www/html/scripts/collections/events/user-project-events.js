/******************************************************************************\
|                                                                              |
|                                user-project-events.js                        |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of user events related to projects.    |
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
	'scripts/models/events/user-project-event',
	'scripts/collections/events/events'
], function($, _, Backbone, Config, Registry, Iso8601, User, UserProjectEvent, Events) {
	return Events.extend({

		//
		// Backbone attributes
		//

		model: UserProjectEvent,

		//
		// ajax methods
		//

		fetch: function(options) {
			return this.fetchByUser(Registry.application.session.user, options);
		},	

		fetchByUser: function(user, options) {
			return Events.prototype.fetch.call(this, _.extend(options || {}, {
				url: Config.registryServer + '/users/' + user.get('user_uid') + '/projects/users/events'
			}));
		},	

		//
		// overridden Backbone methods
		//

		parse: function(data) {
			var events = [];
			for (var i = 0; i < data.length; i++) {
				var item = data[i];
				events.push(new UserProjectEvent({
					'date': Date.parseIso8601(item.event_date),
					'event_type': data[i].event_type,
					'user': new User(item.user),
					'project_uid': item.project_uid
				}));
			}
			return events;
		}
	}, {

		//
		// static methods
		//

		fetchNumByUser: function(project, user, options) {
			return $.ajax(Config.registryServer + '/users/' + user.get('user_uid') + '/projects/users/events', {
				success: function(data) {

					// count events belonging to specific project
					//
					var count = 0;
					var projectUid = project.get('project_uid');
					for (var i = 0; i < data.length; i++) {
						if (data[i].project_uid == projectUid) {
							count++;
						}
					}
					options.success(count);
				}
			});
		}
	});
});