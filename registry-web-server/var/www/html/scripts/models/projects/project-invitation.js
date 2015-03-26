/******************************************************************************\
|                                                                              |
|                               project-invitation.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an instance of an invitation to join a project.          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config',
	'scripts/models/users/user',
	'scripts/models/projects/project',
	'scripts/models/utilities/timestamped'
], function($, _, Backbone, Config, User, Project, Timestamped) {
	return Timestamped.extend({

		//
		// Backbone attributes
		//

		urlRoot: Config.registryServer + '/invitations',

		//
		// methods
		//

		isPending: function() {
			return !this.has('accept_date') && !this.has('decline_date');
		},

		isAccepted: function() {
			return this.has('accept_date');
		},

		isDeclined: function() {
			return this.has('decline_date');
		},

		getStatus: function() {
			if (this.isAccepted()) {
				return 'accepted';
			} else if (this.isDeclined()) {
				return 'declined';
			} else {
				return 'pending';
			}
		},

		accept: function(options) {
			$.ajax(_.extend(options, {
				url: Config.registryServer + '/invitations/' + this.get('invitation_key') + '/accept',
				type: 'PUT'
			}));
		},

		decline: function(options) {
			$.ajax(_.extend(options, {
				url: Config.registryServer + '/invitations/' + this.get('invitation_key') + '/decline',
				type: 'PUT'
			}));
		},

		confirm: function(options) {
			var self = this;

			this.fetch({

				// callbacks
				//
				success: function(data) {
					var status = data.getStatus();

					// check invitation status
					//
					switch (status) {

						case 'accepted':
							if (options.error) {
								options.error("This project invitation has already been accepted.");
							}
							break;

						case 'declined':
							if (options.error) {
								options.error("This project invitation has previously been declined.");
							}
							break;

						default:
							self.confirmInviter({

								// callbacks
								//
								success: function(sender) {
									self.confirmProject({
										success: function(project) {
											if (options.success) {
												options.success(sender, project);
											}
										},

										error: function(message) {
											if (options.error) {
												options.error(message);
											}
										}
									});
								},

								error: function(message) {
									if (options.error) {
										options.error(message);
									}
								}
							});
							break;
					}
				},

				error: function() {
					if (options.error) {
						options.error("This project invitation appears to be invalid or expired. You should contact the project owner for a new invitation.");
					}
				}
			});
		},

		confirmInviter: function(options) {

			// fetch user
			//
			var user = new User({});

			user.fetch({
				url: Config.registryServer + '/invitations/' + this.get('invitation_key') + '/inviter',

				// callbacks
				//
				success: function() {
					if (options.success) {
						options.success(user);
					}
				},

				error: function() {
					if (options.error) {
						options.error("The inviter of this project invitation is not a valid user.");
					}
				}
			});
		},

		confirmInvitee: function(options) {

			// fetch user
			//
			var user = new User({});

			user.fetch({
				url: Config.registryServer + '/invitations/' + this.get('invitation_key') + '/invitee',

				// callbacks
				//
				success: function() {
					if (options.success) {
						options.success(user);
					}
				},

				error: function() {
					if (options.error) {
						options.error("The invitee of this project invitation is not a valid user.");
					}
				}
			});
		},

		confirmProject: function(options) {

			// fetch project
			//
			var project = new Project({
				'project_uid': this.get('project_uid')
			});

			project.fetchProjectConfirmation({

				// callbacks
				//
				success: function() {
					if (options.success) {
						options.success(project);
					}
				},

				error: function() {
					if (options.error) {
						options.error("This invitation appears to be invalid because the project for this invitation is no longer available.");
					}
				}
			});
		},

		getSender: function() {

		},

		//
		// overridden Backbone methods
		//

		url: function() {
			return this.urlRoot + (this.isNew()? '' : '/' + this.get('invitation_key'));
		},

		isNew: function() {
			return !this.has('invitation_key');
		}
	});
});
