/******************************************************************************\
|                                                                              |
|                               tool-details-view.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a tool's profile info.              |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/tools/info/details/tool-details.tpl',
	'scripts/registry',
	'scripts/collections/tools/tool-versions',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/tools/info/details/tool-profile/tool-profile-view',
	'scripts/views/tools/info/versions/tool-versions-list/tool-versions-list-view'
], function($, _, Backbone, Marionette, Template, Registry, ToolVersions, ConfirmView, NotifyView, ErrorView, ToolProfileView, ToolVersionsListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			toolProfile: '#tool-profile',
			toolVersionsList: '#tool-versions-list'
		},

		events: {
			'click #add-new-version': 'onClickAddNewVersion',
			'click #run-new-assessment': 'onClickRunNewAssessment',
			'click #edit-tool': 'onClickEditTool',
			'click #delete-tool': 'onClickDeleteTool',
			'click #show-policy': 'onClickShowPolicy'
		},

		//
		// methods
		//

		initialize: function() {
			this.collection = new ToolVersions();
		},

		//
		// ajax methods
		//

		fetchToolVersions: function(done) {
			var self = this;
			this.collection.fetchByTool(this.model, {

				// callbacks
				//
				success: function() {
					done();
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch tool versions."
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
				isOwned: this.model.isOwned(),
				isAdmin: Registry.application.session.isAdmin(),
				showPolicy: this.model.has('policy_code')
			}));
		},

		onRender: function() {
			var self = this;
			
			// display project profile view
			//
			this.toolProfile.show(
				new ToolProfileView({
					model: this.model
				})
			);

			// fetch and show tool versions
			//
			this.fetchToolVersions(function() {
				self.showToolVersions();
			});
		},

		showToolVersions: function() {

			// show tool versions list view
			//
			this.toolVersionsList.show(
				new ToolVersionsListView({
					model: this.model,
					collection: this.collection
				})
			);
		},

		//
		// event handling methods
		//

		onClickAddNewVersion: function() {

			// go to add tool version view
			//
			/*
			Backbone.history.navigate('#tools/' + this.model.get('tool_uuid') + '/versions/add', {
				trigger: true
			});
			*/
			Registry.application.modal.show(
				new NotifyView({
					message: "This feature is no longer supported."
				})
			);
		},

		onClickRunNewAssessment: function() {

			// go to run new assessment view
			//
			Backbone.history.navigate('#assessments/run?tool=' + this.model.get('tool_uuid'), {
				trigger: true
			});
		},

		onClickEditTool: function() {

			// go to edit tool view
			//
			Backbone.history.navigate('#tools/' + this.model.get('tool_uuid') + '/edit', {
				trigger: true
			});
		},

		onClickDeleteTool: function() {
			var self = this;

			// show confirm dialog
			//
			Registry.application.modal.show(
				new ConfirmView({
					title: "Delete Tool",
					message: "Are you sure that you would like to delete tool " + self.model.get('name') + "? " +
						"When you delete a tool, all of the project data will continue to be retained.",

					// callbacks
					//
					accept: function() {

						// delete user
						//
						self.model.destroy({

							// callbacks
							//
							success: function() {

								// show success notification dialog
								//
								Registry.application.modal.show(
									new NotifyView({
										title: "Tool Deleted",
										message: "This tool has been successfuly deleted.",

										// callbacks
										//
										accept: function() {

											// return to main view
											//
											Backbone.history.navigate('#home', {
												trigger: true
											});
										}
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
		},

		onClickShowPolicy: function() {

			// go to tool policy view
			//
			Backbone.history.navigate('#tools/' + this.model.get('tool_uuid') + '/policy', {
				trigger: true
			});		
		}
	});
});
