/******************************************************************************\
|                                                                              |
|                             edit-tool-details-view.js                        |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for editing a tool's profile info.              |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/tools/info/details/edit-tool-details.tpl',
	'scripts/registry',
	'scripts/views/dialogs/error-view',
	'scripts/views/tools/info/details/tool-profile/tool-profile-form-view'
], function($, _, Backbone, Marionette, Template, Registry, ErrorView, ToolProfileFormView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			toolProfileForm: '#tool-profile-form'
		},

		events: {
			'click #save': 'onClickSave',
			'click #cancel': 'onClickCancel'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, data);
		},

		onRender: function() {

			// display tool profile form view
			//
			this.toolProfileForm.show(
				new ToolProfileFormView({
					model: this.model
				})
			);
		},

		//
		// event handling methods
		//

		onClickSave: function() {
			var self = this;

			// check validation
			//
			if (this.toolProfileForm.currentView.isValid()) {

				// update model
				//
				this.toolProfileForm.currentView.update(this.model);

				// save changes
				//
				this.model.save(undefined, {

					// callbacks
					//
					success: function() {

						// return to tool view
						//
						Backbone.history.navigate('#tools/' + self.model.get('tool_uuid'), {
							trigger: true
						});
					},

					error: function() {

						// show error dialog
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "Could not save tool changes."
							})
						);
					}
				});
			}
		},

		onClickCancel: function() {

			// go to tool view
			//
			Backbone.history.navigate('#tools/' + this.model.get('tool_uuid'), {
				trigger: true
			});
		}
	});
});