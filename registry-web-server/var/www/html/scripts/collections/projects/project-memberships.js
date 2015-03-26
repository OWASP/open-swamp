/******************************************************************************\
|                                                                              |
|                               project-memberships.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of project memberships.                |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config',
	'scripts/models/projects/project-membership'
], function($, _, Backbone, Config, ProjectMembership) {
	return Backbone.Collection.extend({

		//
		// Backbone attributes
		//

		model: ProjectMembership,

		//
		// methods
		//

		numAdmins: function() {
			var count = 0;
			for (var i = 0; i < this.length; i++){
				if (this.at(i).isAdmin()){
					count++;
				}
			}
			return count;
		},

		//
		// ajax methods
		//

		fetchByProject: function(project, options) {
			return this.fetch(_.extend(options, {
				url: Config.registryServer + '/projects/' + project.get('project_uid') + '/memberships'
			}));
		},

		fetchByUser: function(user, options) {
			return this.fetch(_.extend(options, {
				url: Config.registryServer + '/users/' + user.get('user_uid') + '/memberships'
			}));
		},

		// allow bulk saving
		//
		save: function(options) {
			this.sync('update', this, options);
		}
	});
});
