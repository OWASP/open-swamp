/******************************************************************************\
|                                                                              |
|                            schedules-list-item-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for showing a single schedule item.               |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/run-requests/schedules/list/schedules-list-item.tpl',
	'scripts/registry',
	'scripts/models/run-requests/run-request',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view'
], function($, _, Backbone, Marionette, Template, Registry, RunRequest, ConfirmView, NotifyView, ErrorView) {
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
				index: this.options.index + 1,
				url: '#run-requests/schedules/' + this.model.get('run_request_uuid'),
				showNumbering: this.options.showNumbering,
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
					title: "Delete Schedule",
					message: "Are you sure that you want to delete this " + self.model.get('name') + " schedule from this project?",

					// callbacks
					//
					accept: function() {
						var runRequest = new RunRequest();
						self.model.url = runRequest.url;

						self.model.destroy({

							// callbacks
							//
							error: function() {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Could not delete this run request schedule."
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