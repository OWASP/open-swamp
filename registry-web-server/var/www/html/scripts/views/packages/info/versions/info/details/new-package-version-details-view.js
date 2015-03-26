/******************************************************************************\
|                                                                              |
|                        new-package-version-details-view.js                   |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for setting a package versions's details.       |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'clickover',
	'text!templates/packages/info/versions/info/details/new-package-version-details.tpl',
	'scripts/registry',
	'scripts/views/dialogs/error-view',
	'scripts/views/packages/info/versions/info/details/package-version-profile/new-package-version-profile-form-view'
], function($, _, Backbone, Marionette, Clickover, Template, Registry, ErrorView, NewPackageVersionProfileFormView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			newPackageVersionProfileForm: '#new-package-version-profile-form'
		},

		events: {
			'click .alert .close': 'onClickAlertClose',
			'click #next': 'onClickNext',
			'click #cancel': 'onClickCancel'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				package: this.options.package
			}));
		},

		onRender: function() {

			// display package version profile form view
			//
			this.newPackageVersionProfileForm.show(
				new NewPackageVersionProfileFormView({
					model: this.model,
					package: this.options.package
				})
			);

			// add popover
			//
			this.$el.find('#formats-supported').clickover({
				'trigger': 'click',
				'placement': 'bottom'
			})
		},

		showWarning: function() {
			this.$el.find('.alert').show();
		},

		hideWarning: function() {
			this.$el.find('.alert').hide();
		},

		//
		// uploading methods
		//

		upload: function(options) {

			// get data to upload
			//
			var data = new FormData(this.newPackageVersionProfileForm.currentView.$el.find('form')[0]);

			// append pertinent model data
			//
			data.append('package_uuid', this.options.package.get('package_uuid'));
			data.append('user_uid', Registry.application.session.user.get('user_uid'));

			// upload
			//
			this.model.upload(data, options);
		},

		//
		// event handling methods
		//

		onClickAlertClose: function() {
			this.hideWarning();
		},

		onClickNext: function() {
			var self = this;

			// check validation
			//
			if (this.newPackageVersionProfileForm.currentView.isValid()) {

				// update model
				//
				this.newPackageVersionProfileForm.currentView.update(this.model);

				// upload model
				//
				this.upload({
					beforeSend: function(event) {
						self.showProgressBar();
					},

					onprogress: function(event) {
						if (event.lengthComputable) {
							var percentComplete = event.loaded / event.total;
							self.showProgressPercent(percentComplete);
						}
					},

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
							'package_path': data.destination_path + '/' + data.uploaded_file
						});

						self.resetProgressBar();

						// show next view
						//
						self.options.parent.showSource();
					},

					error: function(response) {

						// show error dialog view
						//
						Registry.application.modal.show(new ErrorView({
							message: "Package upload error: " + response.statusText
						}));

						self.resetProgressBar();
					}
				});
			} else {

				// show warning
				//
				this.showWarning();
			}
		},

		onClickCancel: function() {

			// go to package view
			//
			Backbone.history.navigate('#packages/' + this.options.package.get('package_uuid'), {
				trigger: true
			});
		},

		//
		// progress bar events
		//

		showProgressBar: function() {

			// fadeTo instead of fadeOut to prevent display: none;
			//
			this.$el.find('.progress').fadeTo(0, 0.0);
			this.$el.find('.progress').removeClass('invisible');
			this.$el.find('.progress').fadeTo(1000, 1.0);
		},

		resetProgressBar: function() {
			this.$el.find('.bar').width('0%');
			this.$el.find('.bar-text').text('');
			this.$el.find('.progress').fadeTo(1000, 0.0);
		},

		showProgressPercent: function(percentage) {
			this.$el.find('.bar').width(percentage * 100 + '%');
			this.$el.find('.bar-text').text("Uploading " + Math.ceil(percentage * 100) + "%");
		}
	});
});
