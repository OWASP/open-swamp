/******************************************************************************\
|                                                                              |
|                               edit-project-view.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for editing a project's profile info.           |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/projects/info/edit-project.tpl',
	'scripts/registry',
	'scripts/utilities/date-format',
	'scripts/views/dialogs/error-view',
	'scripts/views/projects/info/project-profile/project-profile-form-view',
	'scripts/models/viewers/viewer'
], function($, _, Backbone, Marionette, Template, Registry, DateFormat, ErrorView, ProjectProfileFormView, Viewer) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			projectProfileForm: '#project-profile-form'
		},

		events: {
			'click #save': 'onClickSave',
			'click #cancel': 'onClickCancel'
		},

		initialize: function(){
			this.viewer = new Viewer();
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

			// display project profile form view
			//
			this.projectProfileForm.show(
				new ProjectProfileFormView({
					model: this.model
				})
			);
		},

		//
		// event handling methods
		//

		onClickSave: function() {
			var self = this;

			if (this.projectProfileForm.currentView.isValid()) {

				// update model
				//
				this.projectProfileForm.currentView.update(this.model);

				// ensure timezone isn't affected
				//
				this.model.set({
					accept_date: this.model.get('accept_date') ? dateFormat(this.model.get('accept_date'), 'yyyy-mm-dd HH:MM:ss') : this.model.get('accept_date'),
					create_date: this.model.get('create_date') ? dateFormat(this.model.get('create_date'), 'yyyy-mm-dd HH:MM:ss') : this.model.get('create_date'),
					denial_date: this.model.get('denial_date') ? dateFormat(this.model.get('denial_date'), 'yyyy-mm-dd HH:MM:ss') : this.model.get('denial_date'),
					deactivation_date: this.model.get('deactivation_date') ? dateFormat(this.model.get('deactivation_date'), 'yyyy-mm-dd HH:MM:ss') : this.model.get('deactivation_date')
				});

				// update project default viewer relationship
				//
				/*
				var updated = this.viewer.updateProjectDefaultViewer({
					project_uid: this.model.get('project_uid'),
					viewer_uuid: this.model.get('viewer_uuid')
				});
				*/

				// save changes
				//
				this.model.save(undefined, {

					// callbacks
					//
					success: function() {

						// return to project view
						//
						Backbone.history.navigate('#projects/' + self.model.get('project_uid'), {
							trigger: true
						});
					},

					error: function() {

						// show error dialog
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "Could not save project changes."
							})
						);
					}
				});
			} // if isValid
		},

		onClickCancel: function() {
			Backbone.history.navigate('#projects/' + this.model.get('project_uid'), {
				trigger: true
			});
		}
	});
});
