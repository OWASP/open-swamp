/******************************************************************************\
|                                                                              |
|                                 project-events.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of user events.                        |
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
	'scripts/models/events/project-event',
	'scripts/collections/events/events'
], function($, _, Backbone, Config, Registry, Iso8601, ProjectEvent, Events) {
	return Events.extend({

		//
		// Backbone attributes
		//

		model: ProjectEvent,

		//
		// ajax methods
		//

		fetch: function(options) {
			return this.fetchByUser(Registry.application.session.user, options);
		},

		fetchByUser: function(user, options) {
			return Events.prototype.fetch.call(this, _.extend(options || {}, {
				url: Config.registryServer + '/users/' + user.get('user_uid') + '/projects/events'
			}));
		},

		//
		// overridden Backbone methods
		//

		parse: function(data) {
			var events = [];
			for (var i = 0; i < data.length; i++) {
				var item = data[i];

				// parse event date
				//
				if (item.event_date) {
					if (item.event_date === '0000-00-00 00:00:00') {
						item.event_date = new Date(0);
					} else {
						item.event_date = Date.parseIso8601(item.event_date);
					}
				}

				// create new project event
				//
				events.push(new ProjectEvent({
					'event_type': data[i].event_type,
					'date': item.event_date,
					'project_uid': item.project_uid,
					'project_full_name': item.full_name,
					'project_short_name': item.short_name
				}));
			}
			return events;
		}
	}, {

		//
		// static methods
		//

		fetchNumByUser: function(project, user, options) {
			return $.ajax(Config.registryServer + '/users/' + user.get('user_uid') + '/projects/events', {
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