/******************************************************************************\ 
|                                                                              |
|                    package-version-source-profile-form-view.js               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a package version's source          |
|        information.                                                          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'validate',
	'tooltip',
	'clickover',
	'typeahead',
	'text!templates/packages/info/versions/info/source/source-profile/package-version-source-profile-form.tpl',
	'scripts/registry',
	'scripts/utilities/file-utils',
	'scripts/views/dialogs/error-view',
	'scripts/views/packages/info/versions/info/build/build-profile/dialogs/select-package-version-directory-view'
], function($, _, Backbone, Marionette, Validate, Tooltip, Clickover, Typeahead, Template, Registry, FileUtils, ErrorView, SelectPackageVersionDirectoryView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		events: {
			'click #select-package-path': 'onClickSelectPackagePath'
		},

		//
		// query methods
		//

		getPackagePath: function() {
			return this.$el.find('#package-path').val();
		},
		
		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model,
				package: this.options.package
			}));
		},

		onRender: function() {

			// set default package path if it has not previously been set
			//
			if (this.getPackagePath() == '') {
				this.setDefaultPackagePath();
			}

			// display tooltips on focus
			//
			this.$el.find('input, textarea').popover({
				trigger: 'focus'
			});

			// validate the form
			//
			this.validator = this.validate();
		},

		//
		// defaults setting methods
		//

		setDefaultPackagePath: function(done) {
			var self = this;

			// fetch package version directory tree
			//
			this.model.fetchFileTree({
				data: {
					'dirname': '.'
				},

				// callbacks
				//
				success: function(data) {
					if (_.isArray(data) || !isDirectoryName(data.name)) {
						self.$el.find('#package-path').val('.');
					} else {
						self.$el.find('#package-path').val(data.name);
					}

					// perform done callback
					//
					if (done) {
						done();
					}
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch directory tree for this package version."
						})
					);	
				}
			});
		},

		//
		// form validation methods
		//

		isValid: function() {
			return this.validator.form();
		},

		validate: function() {
			return this.$el.find('form').validate({

				// callbacks
				//
				highlight: function(element) {
					$(element).closest('.control-group').removeClass('success').addClass('error');
				},

				success: function(element) {
					element
					.text('OK!').addClass('valid')
					.closest('.control-group').removeClass('error').addClass('success');
				}
			});
		},

		//
		// form methods
		//

		update: function(packageVersion) {

			// update package version
			//
			packageVersion.set({
				'source_path': this.getPackagePath()
			});
		},

		//
		// event handling methods
		//

		onClickSelectPackagePath: function(event) {
			var self = this;

			// show select package version directory dialog
			//
			Registry.application.modal.show(
				new SelectPackageVersionDirectoryView({
					model: this.model,
					title: "Select Package Path",
					className: 'wide',
					selectedDirectoryName: this.getPackagePath(),

					// callbacks
					//
					accept: function(selectedDirectoryName) {

						// set package path input
						//
						self.$el.find('#package-path').val(selectedDirectoryName);
					}
				})
			);

			// prevent event defaults
			//
			event.stopPropagation();
			event.preventDefault();
		}
	});
});
