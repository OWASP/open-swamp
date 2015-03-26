/******************************************************************************\
|                                                                              |
|                                    users.js                                  |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of users.                              |
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
	'scripts/models/users/user'
], function($, _, Backbone, Config, Registry, User) {
	return Backbone.Collection.extend({

		//
		// Backbone attributes
		//

		model: User,
		url: Config.registryServer + '/users',

		//
		// ajax methods
		//

		fetchByProject: function(project, options) {
			return this.fetch(_.extend(options, {
				url: Config.registryServer + '/projects/' + project.get('project_uid') + '/users'
			}));
		},

		fetchAdmins: function(admin, options) {
			return this.fetch(_.extend(options, {
				url: Config.registryServer + '/admins/' + admin.get('user_uid') + '/admins'
			}));
		},

		fetchByInvitees: function(options) {
			return this.fetch(_.extend(options, {
				url: Config.registryServer + '/admin_invitations/invitees'
			}));
		},

		fetchByInviters: function(options) {
			return this.fetch(_.extend(options, {
				url: Config.registryServer + '/admin_invitations/inviters'
			}));
		},

		fetchAll: function(options) {
			return this.fetch(_.extend(options, {
				url: Config.registryServer + '/admins/' + Registry.application.session.user.get('user_uid') + '/users'
			}));
		},

		sendEmail: function( subject, body, options ){
			var recipients = this.map(function( model ){
				return model.get('email');
			});
			$.ajax(_.extend(options, {
				type: 'POST',
				url: Config.registryServer + '/admins_email',
				data: {
					subject: subject,
					body: body,
					recipients: recipients
				}
			}));
		},

		// allow bulk saving
		//
		save: function(options) {
			this.sync('update', this, options);
		}
	});
});
