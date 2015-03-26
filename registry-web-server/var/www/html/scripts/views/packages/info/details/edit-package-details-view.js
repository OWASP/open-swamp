/******************************************************************************\
|                                                                              |
|                           edit-package-details-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for editing a package's profile info.           |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/packages/info/details/edit-package-details.tpl',
	'scripts/registry',
	'scripts/views/dialogs/error-view',
	'scripts/views/packages/info/details/package-profile/package-profile-form-view'
], function($, _, Backbone, Marionette, Template, Registry, ErrorView, PackageProfileFormView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			packageProfileForm: '#package-profile-form'
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
				package: this.model
			}));
		},

		onRender: function() {

			// display package profile form view
			//
			this.packageProfileForm.show(
				new PackageProfileFormView({
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
			if (this.packageProfileForm.currentView.isValid()) {

				// update model
				//
				this.packageProfileForm.currentView.update(this.model);

				// save changes
				//
				this.model.save(undefined, {

					// callbacks
					//
					success: function() {

						// return to package view
						//
						Backbone.history.navigate('#packages/' + self.model.get('package_uuid'), {
							trigger: true
						});
					},

					error: function() {

						// show error dialog
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "Could not save package changes."
							})
						);
					}
				});
			}
		},

		onClickCancel: function() {
			Backbone.history.navigate('#packages/' + this.model.get('package_uuid'), {
				trigger: true
			});
		}
	});
});
