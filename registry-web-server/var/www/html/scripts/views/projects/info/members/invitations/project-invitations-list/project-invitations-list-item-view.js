/******************************************************************************\
|                                                                              |
|                       project-invitations-list-item-view.js                  |
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
	'text!templates/projects/info/members/invitations/project-invitations-list/project-invitations-list-item.tpl',
	'scripts/registry',
	'scripts/utilities/date-format',
	'scripts/models/projects/project-invitation',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view'
], function($, _, Backbone, Marionette, Template, Registry, DateFormat, ProjectInvitation, ConfirmView, NotifyView, ErrorView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		tagName: 'tr',

		events: {
			'click .delete': 'onClickDelete'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model,
				showDelete: this.options.showDelete
			}));
		},

		//
		// event handling methods
		//

		onClickDelete: function() {
			var self = this;

			// show confirm dialog
			//
			Registry.application.modal.show(
				new ConfirmView({
					title: "Delete Project Invitation",
					message: "Are you sure that you want to delete this invitation of " + this.model.get('invitee_name') + " to project " + self.options.project.get('full_name') + "?",

					// callbacks
					//
					accept: function() {
						var projectInvitation = new ProjectInvitation({
							'invitation_key': self.model.get('invitation_key')
						});

						// delete project invitation
						//
						self.model.destroy({
							url: projectInvitation.url(),

							// callbacks
							//
							success: function() {

								// show success notify
								//
								Registry.application.modal.show(
									new NotifyView({
										message: "This project invitation has successfully been deleted."
									})
								);
							},

							error: function() {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Could not delete this project invitation."
									})
								);
							}
						});
					}
				})
			);
		}
	});
});
