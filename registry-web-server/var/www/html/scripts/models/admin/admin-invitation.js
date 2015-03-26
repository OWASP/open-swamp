/******************************************************************************\
|                                                                              |
|                                admin-invitation.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an instance of an invitation to become a                 |
|        system administrator.                                                 |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'scripts/config',
	'scripts/registry',
	'scripts/models/utilities/timestamped',
	'scripts/models/users/user',
	'scripts/views/dialogs/error-view'
], function($, _, Config, Registry, Timestamped, User, ErrorView) {
	return Timestamped.extend({

		//
		// Backbone attributes
		//

		urlRoot: Config.registryServer + '/admin_invitations',

		//
		// methods
		//

		isPending: function() {
			return this.getStatus() === 'pending';
		},

		isAccepted: function() {
			return this.getStatus() === 'accepted';
		},

		isDeclined: function() {
			return this.getStatus() === 'declined';
		},

		getStatus: function() {
			if (this.has('status')) {
				return this.get('status').toLowerCase();
			} else if (this.has('accept_date')) {
				return 'accepted';
			} else if (this.has('decline_date') && (this.get('decline_date') !== null)) {
				return 'declined';
			} else {
				return 'pending';
			}
		},

		//
		// ajax methods
		//

		send: function(email, options) {
			var self = this;

			// find user associated with this email
			//
			var response = $.ajax({
				url: Config.registryServer + '/users/email/user',
				type: 'POST',
					dataType: 'json',

					// callbacks
					//
					data: {
						'email': email
					},

				// callbacks
				//
				success: function(data) {
					self.save({
						'invitee_uid': data.user_uid
					}, options);
				},

				error: function() {
					Registry.application.modal.show(
						new ErrorView({
							message: response.responseText
						})
					);
				}
			});

			return response;
		},

		accept: function(options) {
			$.ajax(_.extend(options, {
				url: Config.registryServer + '/admin_invitations/' + this.get('invitation_key') + '/accept',
				type: 'PUT'
			}));
		},

		decline: function(options) {
			$.ajax(_.extend(options, {
				url: Config.registryServer + '/admin_invitations/' + this.get('invitation_key') + '/decline',
				type: 'PUT'
			}));
		},

		confirm: function(options) {
			var self = this;

			this.fetch({

				// callbacks
				//
				success: function(data) {

					// check invitation status
					//
					switch (self.getStatus()) {

						case 'accepted': 
							if (options.error) {
								options.error("This admin invitation has already been accepted.");
							}
							break;

						case 'declined':
							if (options.error) {
								options.error("This admin invitation has previously been declined.");
							}	
							break;

						default:
							self.confirmParticipants(options);
							break;
					}
				},

				error: function() {
					if (options.error) {
						options.error("This invitation appears to be invalid or expired. You should contact the project owner for a new invitation.");
					}
				}
			});
		},

		confirmParticipants: function(options) {
			var self = this;
			var inviter = new User(this.get('inviter'));
			var invitee = new User(this.get('invitee'));
			options.success(inviter, invitee);
		},

		//
		// overridden Backbone methods
		//

		url: function() {
			return this.urlRoot + (this.isNew()? '' : '/' + this.get('invitation_key'));
		},

		isNew: function() {
			return !this.has('invitation_key');
		},

		parse: function(response) {

			// call superclass method
			//
			response = Timestamped.prototype.parse.call(this, response);

			// create user models
			//
			if (response.inviter) {
				response.inviter = new User(response.inviter);
			}
			if (response.invitee) {
				response.invitee = new User(response.invitee);
			}

			return response;
		}
	});
});
