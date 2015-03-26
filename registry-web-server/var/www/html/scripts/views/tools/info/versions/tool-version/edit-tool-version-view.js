/******************************************************************************\
|                                                                              |
|                               edit-tool-version-view.js                      |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for editing a tool's version info.              |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/tools/info/versions/tool-version/edit-tool-version.tpl',
	'scripts/registry',
	'scripts/views/dialogs/error-view',
	'scripts/views/tools/info/versions/tool-version/tool-version-profile/tool-version-profile-form-view'
], function($, _, Backbone, Marionette, Template, Registry, ErrorView, ToolVersionProfileFormView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			toolVersionProfileForm: '#tool-version-profile-form'
		},

		events: {
			'click #save': 'onClickSave',
			'click #cancel': 'onClickCancel'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model,
				tool: this.options.tool,
				'tool_name': this.options.tool.get('name')
			}));
		},

		onRender: function() {
			this.toolVersionProfileForm.show(
				new ToolVersionProfileFormView({
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
			if (this.toolVersionProfileForm.currentView.isValid()) {

				// update model
				//
				this.toolVersionProfileForm.currentView.update(this.model);

				// save changes
				//
				this.model.save(undefined, {

					// callbacks
					//
					success: function() {

						// return to tool version view
						//
						Backbone.history.navigate('#tools/versions/' + self.model.get('tool_version_uuid'), {
							trigger: true
						});
					},

					error: function() {

						// show error dialog
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "Could not save tool version changes."
							})
						);
					}
				});
			}
		},

		onClickCancel: function() {

			// go to add tool version view
			//
			Backbone.history.navigate('#tools/versions/' + this.model.get('tool_version_uuid'), {
				trigger: true
			});
		}
	});
});
