/******************************************************************************\
|                                                                              |
|                            new-package-details-view.js                       |
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
	'text!templates/packages/info/details/new-package-details.tpl',
	'scripts/registry',
	'scripts/views/dialogs/error-view',
	'scripts/views/packages/info/details/package-profile/new-package-profile-form-view'
], function($, _, Backbone, Marionette, Clickover, Template, Registry, ErrorView, NewPackageProfileFormView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			newPackageProfileForm: '#new-package-profile-form'
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
				model: this.model
			}));
		},

		onRender: function() {

			// display package profile form view
			//
			this.newPackageProfileForm.show(
				new NewPackageProfileFormView({
					model: this.model,
					packageVersion: this.options.packageVersion
				})
			);

			// add popover
			//
			this.$el.find('#formats-supported').clickover({
				'trigger': 'click',
				'placement': 'bottom'
			});
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
			var data = new FormData(this.newPackageProfileForm.currentView.$el.find('form')[1]);

			// append pertinent model data
			//
			data.append('user_uid', Registry.application.session.user.get('user_uid'));
			data.append('external_url', this.model.get('external_url'));

			// upload
			//
			this.options.packageVersion.upload(data, options);
		},

		//
		// progress bar handling methods
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

			// Progress from 0 to 1
			//
			this.$el.find('.bar').width(percentage * 100 + '%');
			this.$el.find('.bar-text').text("Uploading " + Math.ceil(percentage * 100) + "%");
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
			if (this.newPackageProfileForm.currentView.isValid()) {

				// update model
				//
				this.newPackageProfileForm.currentView.update(this.model, this.options.packageVersion);

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
						self.options.packageVersion.set({
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

				// display warning message bar
				//
				this.showWarning();
			}
		},

		onClickCancel: function() {

			// return to packages view
			//
			Backbone.history.navigate('#packages', {
				trigger: true
			});
		}
	});
});
