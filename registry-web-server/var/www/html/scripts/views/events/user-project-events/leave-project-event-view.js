/******************************************************************************\
|                                                                              |
|                             leave-project-event-view.js                      |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view that shows a user project event.                  |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'scripts/registry',
	'text!templates/events/user-project-events/leave-project-event.tpl',
	'scripts/views/events/user-project-events/user-project-event-view'
], function($, _, Backbone, Marionette, Registry, Template, UserProjectEventView) {
	return UserProjectEventView.extend({

		//
		// methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				date: this.model.get('date'),
				projectUrl: Registry.application.getURL() + '#projects/' + this.model.get('project_uid')
			}));
		}
	});
});