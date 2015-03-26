/******************************************************************************\
|                                                                              |
|                              project-profile-view.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view of a project's profile information.               |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/projects/info/project-profile/project-profile.tpl',
	'scripts/models/viewers/viewer'
], function($, _, Backbone, Marionette, Template, Viewer) {
	return Backbone.Marionette.ItemView.extend({

		//
		// rendering methods
		//
		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model
			}));
		}

	});
});
