/******************************************************************************\
|                                                                              |
|                         project-members-list-item-view.js                    |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a list of project members.          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/projects/info/members/list/project-members-list-item.tpl',
	'scripts/registry',
	'scripts/utilities/date-format',
	'scripts/views/dialogs/error-view',
	'scripts/views/dialogs/confirm-view'
], function($, _, Backbone, Marionette, Template, Registry, DateFormat, ErrorView, ConfirmView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		tagName: 'tr',

		events: {
			'click .delete': 'onClickDelete',
			'click .admin input': 'onClickAdminCheckbox'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model,
				isAdmin: Registry.application.session.isAdmin(),
				project: this.options.project,
				projectMembership: this.options.projectMembership,
				currentProjectMembership: this.options.currentProjectMembership,
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
					title: "Delete Project Member",
					message: "Are you sure that you want to delete " + this.model.getFullName() + " from the project, " + this.options.project.get('full_name') + "?",

					// callbacks
					//
					accept: function() {
						self.options.projectMembership.destroy({

							// callbacks
							//
							success: function() {

								// remove user
								//
								self.collection.remove(self.model);
							},

							error: function() {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Could not delete this project membership."
									})
								);
							}
						});
					}
				})
			);
		},

		onClickAdminCheckbox: function(event) {
			var isChecked = ($(event.currentTarget).is(':checked'));

			// update admin flag
			//
			this.options.projectMembership.setAdmin(isChecked);
		}
	});
});
