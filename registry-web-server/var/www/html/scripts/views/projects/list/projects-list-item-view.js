/******************************************************************************\
|                                                                              |
|                             projects-list-item-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for displaying a single item belonging to         |
|        a list of projects.                                                   |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/projects/list/projects-list-item.tpl',
	'scripts/registry',
	'scripts/utilities/date-format',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/error-view'
], function($, _, Backbone, Marionette, Template, Registry, DateFormat, ConfirmView, ErrorView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		tagName: 'tr',

		events: {
			'click .delete': 'onClickDelete'
		},

		//
		// methods
		//

		deleteProject: function() {
			var self = this;
			this.model.destroy({

				// callbacks
				//
				success: function() {

					// refresh parent
					//
					self.options.parent.render();
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not delete this project."
						})
					);
				}
			});
		},

		deleteProjectMembership: function() {
			var self = this;
			this.model.deleteCurrentMember({

				// callbacks
				//
				success: function() {

					// refresh parent
					//
					self.options.parent.collection.remove(self.model);
					self.options.parent.render();
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not delete this project member."
						})
					);
				}
			});	
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model,
				collection: this.collection,
				index: this.options.index + 1,
				showDeactivatedProjects: this.options.showDeactivatedProjects,
				showNumbering: this.options.showNumbering,
				showDelete: this.options.showDelete && this.model.isOwnedBy(Registry.application.session.user)
			}));
		},

		//
		// event handling methods
		//

		onClickDelete: function() {
			var self = this;
			if (this.model.isOwnedBy(Registry.application.session.user)) {
			
				// show confirm dialog
				//
				Registry.application.modal.show(
					new ConfirmView({
						title: "Delete Project",
						message: "Are you sure that you would like to delete project " + self.model.get('full_name') + "? " +
							"When you delete a project, all of the project data will continue to be retained.",

						// callbacks
						//
						accept: function() {
							self.deleteProject();
						}
					})
				);
			} else {

				// show confirm dialog
				//
				Registry.application.modal.show(
					new ConfirmView({
						title: "Delete Project Membership",
						message: "Are you sure that you would like to delete your membership from project " + self.model.get('full_name') + "? ",

						// callbacks
						//
						accept: function() {
							self.deleteProjectMembership();
						}
					})
				);				
			}
		},
	});
});
