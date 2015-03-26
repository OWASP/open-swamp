/******************************************************************************\
|                                                                              |
|                        new-project-invitations-list-view.js                  |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view that shows a list a user project invitations.     |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/projects/info/members/invitations/new-project-invitations-list/new-project-invitations-list-item.tpl',
	'scripts/registry',
	'scripts/models/projects/project-invitation',
	'scripts/views/dialogs/confirm-view'
], function($, _, Backbone, Marionette, Template, Registry, ProjectInvitation, ConfirmView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		tagName: 'tr',

		events: {
			'click #add': 'onClickAdd',
			'click .delete': 'onClickDelete',
			'blur .name': 'onBlurName',
			'blur .email': 'onBlurEmail'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				collection: this.collection,
				model: this.model,
				showDelete: this.options.showDelete
			}));
		},

		//
		// event handling methods
		//

		onClickDelete: function() {
			var self = this;
			var message;

			if (this.model.has('invitee_name')) {
				message = "Are you sure you want to delete the invitation of " + this.model.get('invitee_name') + " to the project, " + this.options.project.get('full_name') + "?";
			} else {
				message = "Are you sure you want to delete this invitation to the project, " + this.options.project.get('full_name') + "?";
			}

			// show confirm dialog
			//
			Registry.application.modal.show(
				new ConfirmView({
					title: "Delete New Project Invitation",
					message: message,

					// callbacks
					//
					accept: function() {
						self.model.destroy();
					}
				})
			);
		},

		onBlurName: function(event) {
			var name = $(event.target).val();
			if (name === '') {
				name = undefined;
			}
			this.model.set({
				'invitee_name': name
			});
		},

		onBlurEmail: function(event) {
			var email = $(event.target).val();
			if (email === '') {
				email = undefined;
			}
			this.model.set({
				'email': email
			});
		}
	});
});
