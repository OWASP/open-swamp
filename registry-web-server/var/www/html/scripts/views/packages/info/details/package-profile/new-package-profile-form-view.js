/******************************************************************************\
|                                                                              |
|                           new-package-profile-form-view.js                   |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an editable form view of a package's profile             |
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
	'text!templates/packages/info/details/package-profile/new-package-profile-form.tpl',
	'scripts/config',
	'scripts/views/packages/info/versions/info/details/package-version-profile/new-package-version-profile-form-view',
], function($, _, Backbone, Marionette, Validate, Tooltip, Clickover, Template, Config, NewPackageVersionProfileFormView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			newPackageVersionProfileForm: '#new-package-version-profile-form'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model
			}));
		},

		initialize: function() {
			var self = this;

			$.validator.addMethod('external-url', function(value) {
				self.model.set('external_url', value);
				if( value === '' ){ 
					return true; 
				}
				if( self.model.hasValidExternalUrl() ){ 
					var file = $(document).find('#archive').val('');
					return true;
				}
				return false;
			}, "Not a valid GitHub HTTPS url.");

		},

		onRender: function() {

			// display tooltips on focus
			//
			this.$el.find('input, textarea').popover({
				trigger: 'focus'
			});

			// display select tooltips on mouse over
			//
			this.$el.find('select').popover({
				trigger: 'focus'
			});

			// show package version profile form
			//
			this.newPackageVersionProfileForm.show(
				new NewPackageVersionProfileFormView({
					parent:	this,
					package: this.model,
					model: this.options.packageVersion
				})
			);

			// validate the form
			//
			this.validator = this.validate();
		},

		//
		// form validation methods
		//

		isValid: function() {
			return this.validator.form();
		},

		validate: function() {
			return this.$el.find('form').validate({

				rules: {
					'name': {
						required: true,
					}
				},

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

		update: function(package, packageVersion) {

			// get values from form
			//
			var name = this.$el.find('#name').val();
			var description = this.$el.find('#description').val();
			var external_url = this.$el.find('#external-url').val();

			// update model
			//
			package.set({
				'name': name,
				'description': description,
				'external_url': external_url
			});

			// update version
			//
			this.newPackageVersionProfileForm.currentView.update(packageVersion);
		}
	});
});
