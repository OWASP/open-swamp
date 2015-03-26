/******************************************************************************\
|                                                                              |
|                           tool-versions-list-item-view.js                    |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for showing a single tool list item.              |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/tools/info/versions/tool-versions-list/tool-versions-list-item.tpl',
	'scripts/registry',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
], function($, _, Backbone, Marionette, Template, Registry, ConfirmView, NotifyView, ErrorView) {
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
				url: Registry.application.session.user? Registry.application.getURL() + '#tools/versions/' + this.model.get('tool_version_uuid') : undefined,
				showDelete: this.options.tool.isOwned()
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
					title: "Delete Tool Version",
					message: "Are you sure that you want to delete version " + self.model.get('version_string') + " of " + self.options.tool.get('name') + "?",

					// callbacks
					//
					accept: function() {
						self.model.destroy({
							
							// callbacks
							//
							error: function() {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Could not delete this tool version."
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