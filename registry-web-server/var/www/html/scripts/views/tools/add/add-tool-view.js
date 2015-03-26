/******************************************************************************\
|                                                                              |
|                                  add-tool-view.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view used to add / upload new tools.                 |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/tools/add/add-tool.tpl',
	'scripts/registry',
	'scripts/models/tools/tool',
	'scripts/models/tools/tool-version',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/tools/info/details/tool-profile/new-tool-profile-form-view'
], function($, _, Backbone, Marionette, Template, Registry, Tool, ToolVersion, NotifyView, ErrorView, NewToolProfileFormView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			newToolProfileForm: '#new-tool-profile-form'
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
			this.model = new Tool({
				'tool_owner_uuid': this.options.user.get('user_uid'),
				'tool_sharing_status': 'private'
			});
			this.toolVersion = new ToolVersion({});
		},

		save: function() {
			var self = this;

			// save tool
			//
			this.model.save(undefined, {

				// callbacks
				//
				success: function() {

					// save tool version
					//
					self.saveVersion(self.model);
				}, 

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not save tool."
						})
					);
				}
			});
		},

		saveVersion: function(tool) {
			var self = this;

			// set tool version attributes
			//
			this.toolVersion.set({
				'tool_uuid': tool.get('tool_uuid')
			});

			this.toolVersion.save(undefined, {

				success: function() {
					self.toolVersion.add({
						data: {
							'tool_path': self.toolVersion.get('tool_path')
						},

						// callbacks
						//
						success: function() {

							// show success notification dialog
							//
							Registry.application.modal.show(
								new NotifyView({
									message: "Tool " + self.model.get('name') + " version " + self.toolVersion.get('version_string') + " has been uploaded successfully.",

									// callbacks
									//
									accept: function() {
										
										// go to tool view
										//
										Backbone.history.navigate('#tools/' + tool.get('tool_uuid'), {
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
				model: this.model
			}));
		},

		onRender: function() {

			// display tool profile form
			//
			this.newToolProfileForm.show(
				new NewToolProfileFormView({
					model: this.model,
					toolVersion: this.toolVersion
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
			if (this.newToolProfileForm.currentView.isValid()) {

				// update models
				//
				this.newToolProfileForm.currentView.update(this.model, this.toolVersion);

				// get data to upload from form
				//
				var data = new FormData(this.$el.find('#new-tool-version-profile-form form')[0]);

				// append pertitnent model data
				//
				data.append('tool_owner_uuid', this.model.get('tool_owner_uuid'));
				data.append('user_uid', this.options.user.get('user_uid'));

				// upload
				//
				self.toolVersion.upload(data, {

					// callbacks
					//
					success: function(data) {

						// save path to version
						//
						self.toolVersion.set({
							'tool_path': data.destination_path + '/' + data.uploaded_file
						});

						// save tool / version
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

			// go to home view
			//
			Backbone.history.navigate('#home', {
				trigger: true
			});
		}
	});
});
