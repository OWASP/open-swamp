/******************************************************************************\
|                                                                              |
|                          review-tools-list-item-view.js                      |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for displaying a single item belonging to         |
|        a list of tools for review.                                           |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'dropdown',
	'text!templates/tools/review/review-tools-list/review-tools-list-item.tpl',
	'scripts/registry',
	'scripts/utilities/date-format',
	'scripts/views/dialogs/error-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/confirm-view'
], function($, _, Backbone, Marionette, Dropdown, Template, Registry, DateFormat, ErrorView, NotifyView, ConfirmView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		tagName: 'tr',
		
		events: {
			'click a.approved': 'onClickApproved',
			'click a.declined': 'onClickDeclined',
			'click a.revoked': 'onClickRevoked',
			'click a.unrevoked': 'onClickUnrevoked',
			'click a.pending': 'onClickPending',
			'click .delete': 'onClickDelete'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model,
				collection: this.collection,
				index: this.options.index + 1,
				url: Registry.application.getURL() + '#tools/' + this.model.get('tool_uuid'),
				showDeactivatedTools: this.options.showDeactivatedTools,
				showNumbering: this.options.showNumbering,
				showDelete: this.options.showDelete
			}));
		},

		//
		// event handling methods
		//

		onClickApproved: function() {
			this.model.setStatus('approved');
			this.render();
		},

		onClickDeclined: function() {
			this.model.setStatus('declined');
			this.render();
		},

		onClickRevoked: function() {
			this.model.setStatus('revoked');
			this.render();
		},

		onClickUnrevoked: function() {
			this.model.setStatus('unrevoked');
			this.render();
		},

		onClickPending: function() {
			this.model.setStatus('pending');
			this.render();
		},

		onClickDelete: function() {
			var self = this;

			// show confirm dialog
			//
			Registry.application.modal.show(
				new ConfirmView({
					title: "Delete Tool",
					message: "Are you sure that you want to delete tool " + this.model.get('name') + "?",

					// callbacks
					//
					accept: function() {
						self.model.destroy({

							// callbacks
							//
							success: function() {

								// show success notification dialog
								//
								Registry.application.modal.show(
									new NotifyView({
										message: "This tool has been successfuly deleted."
									})
								);
							},

							error: function() {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Could not delete this tool."
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
