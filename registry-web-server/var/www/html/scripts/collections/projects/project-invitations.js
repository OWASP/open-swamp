/******************************************************************************\
|                                                                              |
|                              project-invitations.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of user project invitations.           |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config',
	'scripts/models/projects/project-invitation'
], function($, _, Backbone, Config, ProjectInvitation) {
	return Backbone.Collection.extend({

		//
		// Backbone attributes
		//

		model: ProjectInvitation,

		//
		// ajax methods
		//

		fetchByProject: function(project, options) {
			return this.fetch(_.extend(options, {
				url: Config.registryServer + '/projects/' + project.get('project_uid') + '/invitations'
			}));
		},

		// allow bulk saving
		//
		save: function(options) {
			this.sync('update', this, options);
		}
	});
});