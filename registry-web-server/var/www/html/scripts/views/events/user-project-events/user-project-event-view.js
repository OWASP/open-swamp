/******************************************************************************\
|                                                                              |
|                             user-project-event-view.js                       |
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
	'scripts/models/users/user',
	'scripts/models/projects/project'
], function($, _, Backbone, Marionette, User, Project) {
	return Backbone.Marionette.ItemView.extend({

		//
		// methods
		//

		onRender: function() {
			this.showProject();
		},

		showProject: function() {
			var self = this;
			var project = new Project({
				project_uid: this.model.get('project_uid')
			});

			// fetch project
			//
			project.fetch({

				// callbacks
				//
				success: function() {
					self.$el.find('.project-short-name').html(project.get('short_name'));
					self.$el.find('.project-full-name').html(project.get('full_name'));
				}
			});	
		}
	});
});