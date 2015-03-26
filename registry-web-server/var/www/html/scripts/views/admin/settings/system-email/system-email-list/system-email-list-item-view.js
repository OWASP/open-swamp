/******************************************************************************\
|                                                                              |
|                            system-email-list-view.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for showing system email users.                   |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',	
	'text!templates/admin/settings/system-email/system-email-list/system-email-list-item.tpl',
	'scripts/config',
	'scripts/registry',
	'scripts/views/dialogs/error-view',
	'scripts/views/dialogs/confirm-view',
], function($, _, Backbone, Marionette, Template, Config, Registry, ErrorView, ConfirmView) {
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
				url: Registry.application.getURL() + '#accounts'
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
					title: "Delete Administrator Priviledges",
					message: "Are you sure that you want to delete " + this.model.getFullName() + "'s administrator priviledges?",

					// callbacks
					//
					accept: function() {

						// delete user's admin priviledges
						//
						self.model.destroy({
							url: Config.registryServer + '/email/' + self.model.get('user_uid'),

							// callbacks
							//
							success: function() {

								// re-render view
								//
								self.render();
							},

							error: function() {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Could not delete this user's administrator priviledges."
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
