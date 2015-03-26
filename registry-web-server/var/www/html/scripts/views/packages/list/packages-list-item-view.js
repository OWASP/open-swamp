/******************************************************************************\
|                                                                              |
|                             packages-list-item-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for displaying a single item belonging to         |
|        a list of packages.                                                   |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/packages/list/packages-list-item.tpl',
	'scripts/registry',
	'scripts/utilities/date-format',
	'scripts/views/dialogs/confirm-view',
], function($, _, Backbone, Marionette, Template, Registry, DateFormat, ConfirmView) {
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
				index: this.options.index + 1,
				url: Registry.application.session.user? '#packages/' + this.model.get('package_uuid'): undefined,
				showDelete: this.options.showDelete,
				showNumbering: this.options.showNumbering,
				showDeactivatedPackages: this.options.showDeactivatedPackages
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
					title: "Delete Package",
					message: "Are you sure that you would like to delete package " + self.model.get('name') + "? " +
						"When you delete a package, all of the project data will continue to be retained.",

					// callbacks
					//
					accept: function() {

						// delete user
						//
						self.model.destroy({

							// callbacks
							//
							success: function() {

								// return to packages view
								//
								Backbone.history.navigate('#packages', {
									trigger: true
								});
							},

							error: function() {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: 'Could not delete this package.'
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
