/******************************************************************************\
|                                                                              |
|                          package-versions-list-item-view.js                  |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for showing a single package list item.           |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/packages/info/versions/list/package-versions-list-item.tpl',
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
		// methods
		//

		deleteVersion: function() {
			var self = this;

			// show confirm dialog
			//
			Registry.application.modal.show(
				new ConfirmView({
					title: "Delete Package Version",
					message: "Are you sure that you want to delete version " + this.model.get('version_string') + " of " + this.options.package.get('name') + "?",

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
										message: "Could not delete this package version."
									})
								);
							}
						});
					}
				})
			);
		},

		deletePackage: function() {
			var self = this;
			
			// show confirm dialog
			//
			Registry.application.modal.show(
				new ConfirmView({
					title: "Delete Package",
					message: "Deleting the last version will result in deleting the package. Are you sure that you want to delete package " + this.options.package.get('name') + "?",

					// callbacks
					//
					accept: function() {
						self.options.package.destroy({
							
							// callbacks
							//
							success: function() {

								// go to packages view
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
										message: "Could not delete this package version."
									})
								);
							}
						});
					}
				})
			);
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model,
				url: Registry.application.session.user? Registry.application.getURL() + '#packages/versions/' + this.model.get('package_version_uuid') : undefined,
				showDelete: this.options.package.isOwned()
			}));
		},

		//
		// event handling methods
		//

		onClickDelete: function() {
			if (this.options.collection.length > 1) {
				this.deleteVersion();
			} else {
				this.deletePackage();
			}
		}
	});
});