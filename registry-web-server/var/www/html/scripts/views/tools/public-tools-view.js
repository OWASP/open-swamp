/******************************************************************************\
|                                                                              |
|                                 public-tools-view.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This is a view for showing a list of publicly available tools.        |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/info/resources/tools.tpl',
	'scripts/registry',
	'scripts/collections/tools/tools',
	'scripts/views/dialogs/error-view',
	'scripts/views/tools/list/tools-list-view'
], function($, _, Backbone, Marionette, Template, Registry, Tools, ErrorView, ToolsListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			toolsList: "#tools-list"
		},

		//
		// methods
		//

		initialize: function() {
			this.collection = new Tools();
		},

		//
		// rendering methods
		//


		template: function(data) {
			return _.template(Template, _.extend(data, {
				loggedIn: Registry.application.session.user != null
			}));
		},

		onRender: function() {

			// show subviews
			//
			this.showToolsList();
		},

		showToolsList: function() {
			var self = this;
			this.collection.fetchPublic({

				// callbacks
				//
				success: function() {

					// show list of tools
					//
					self.toolsList.show(
						new ToolsListView({
							collection: self.collection
						})
					);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not get list of tools."
						})
					);
				}
			})
		}
	});
});
