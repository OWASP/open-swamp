/******************************************************************************\
|                                                                              |
|                                add-tool-version-view.js                      |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view used to add / upload new tool versions.         |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/tools/info/versions/add-tool-version/add-tool-version.tpl',
	'scripts/registry',
	'scripts/models/tools/tool',
	'scripts/models/tools/tool-version',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/tools/info/versions/tool-version/tool-version-profile/new-tool-version-profile-form-view'
], function($, _, Backbone, Marionette, Template, Registry, Tool, ToolVersion, NotifyView, ErrorView, NewToolVersionProfileFormView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			newToolVersionProfile: '#new-tool-version-profile'
		},

		events: {
			'click .alert .close': 'onClickAlertClose',
			'click #submit': 'onClickSubmit',
			'click #cancel': 'onClickCancel'
		},

		//
		// methods
		//

		initialize: function() {
			this.model = new ToolVersion({
				tool_uuid: this.options.tool.get('tool_uuid')
			});
		},

		save: function() {
			var self = this;
			this.model.save(undefined, {

				// callbacks
				//
				success: function() {
					self.model.add({
						data: {
							'tool_path': self.model.get('tool_path')
						},

						// callbacks
						//
						success: function() {

							// show success notification dialog
							//
							Registry.application.modal.show(
								new NotifyView({
									message: "Tool " + self.options.tool.get('name') + " version " + self.model.get('version_string') + " has been uploaded successfully.",

									// callbacks
									//
									accept: function() {
										
										// go to tool view
										//
										Backbone.history.navigate('#tools/' + self.options.tool.get('tool_uuid'), {
											trigger: true
										});
									}
								})
							);
						},

						error: function(response) {

							// show error dialog
							//
							Registry.application.modal.show(
								new ErrorView({
									message: response.responseText
								})
							);
						}
					});
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not save tool version."
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
				tool: this.options.tool,
				model: this.model
			}));
		},

		onRender: function() {

			// display tool profile form
			//
			this.newToolVersionProfile.show(
				new NewToolVersionProfileFormView({
					model: this.model
				})
			);
		},

		showWarning: function() {
			this.$el.find('.alert').show();
		},

		hideWarning: function() {
			this.$el.find('.alert').hide();
		},

		//
		// event handling methods
		//

		onClickAlertClose: function() {
			this.hideWarning();
		},

		onClickSubmit: function() {
			var self = this;

			// check validation
			//
			if (this.newToolVersionProfile.currentView.isValid()) {

				// update models
				//
				this.newToolVersionProfile.currentView.update(this.model);

				// get data to upload
				//
				var data = new FormData(this.$el.find('#new-tool-version-profile form')[0]);

				// append pertitnent model data
				//
				data.append('tool_owner_uuid', this.options.tool.get('tool_owner_uuid'));
				data.append('user_uid', Registry.application.session.user.get('user_uid'));

				// upload
				//
				this.model.upload(data, {

					// callbacks
					//
					success: function(data) {
						
						// convert returned data to an object, if necessary
						//
						if (typeof(data) === 'string') {
							data = $.parseJSON(data);
						}

						// save path to version
						//
						self.model.set({
							'tool_path': data.destination_path + '/' + data.uploaded_file
						});

						// save tool version
						//
						self.save();
					},

					error: function(response) {

						// show error dialog
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "Tool " + response.statusText
							})
						);
					}
				});

			} else {
				this.showWarning();
			}
		},

		onClickCancel: function() {

			// return to tool view
			//
			Backbone.history.navigate('#tools/' + this.options.tool.get('tool_uuid'), {
				trigger: true
			});
		}
	});
});
