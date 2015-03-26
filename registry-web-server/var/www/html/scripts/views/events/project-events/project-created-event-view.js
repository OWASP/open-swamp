/******************************************************************************\
|                                                                              |
|                             project-created-event-view.js                    |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view that shows a project event.                       |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/events/project-events/project-created-event.tpl',
	'scripts/registry'
], function($, _, Backbone, Marionette, Template, Registry) {
	return Backbone.Marionette.ItemView.extend({

		//
		// methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				date: this.model.get('date'),
				url: Registry.application.getURL() + '#projects/' + this.model.get('project_uid')
			}));
		}
	});
});