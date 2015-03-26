/******************************************************************************\
|                                                                              |
|                       new-package-version-profile-form-view.js               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view of a package versions's profile information.      |
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
	'scripts/registry',
	'text!templates/packages/info/versions/info/details/package-version-profile/new-package-version-profile-form.tpl',
	'scripts/views/packages/info/versions/info/details/package-version-profile/package-version-profile-form-view',
	'scripts/views/dialogs/notify-view'
], function($, _, Backbone, Marionette, Validate, Tooltip, Clickover, Registry, Template, PackageVersionProfileFormView, NotifyView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			packageVersionProfileForm: '#package-version-profile-form'
		},

		events: {
			'click #archive': 'onClickArchive',
			'click #use-external-url': 'onClickUseExternalUrl'
		},

		//
		// methods
		//

		initialize: function() {
			var self = this;

			// add archive validation rule
			//
			$.validator.addMethod('archive', function(value) {
				if( self.options.package.hasValidExternalUrl() ){
					if(  self.$el.find('#use-external-url').length > 0 ){
						if( self.$el.find('#use-external-url').is(':checked') ){
							return true;
						}
					} else {
						return true;
					}
				}
				var fileName = self.model.getFilenameFromPath(value);
				return self.model.isAllowedFilename(fileName);
			}, function( params, element ){

				if(  self.$el.find('#use-external-url').length > 0 ){
					if( ! self.$el.find('#use-external-url').is(':checked') ){
						if( $(element).val() ) {
							return "This file is not a recognized archive file format.";
						} else {
							return "This field is required.";
						}
					}
				}

				return $(element).val() ? "This file is not a recognized archive file format." : "This field is required.";

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

			// show package version profile form
			//
			this.packageVersionProfileForm.show(
				new PackageVersionProfileFormView({
					model: this.model,
					package: this.options.package
				})
			);

			// display tooltips on focus
			//
			this.$el.find("input[type='text'], textarea").popover({
				trigger: 'focus'
			});

			// display archive file tooltips on mouse over
			//
			this.$el.find("input[type='file']").popover({
				trigger: 'hover'
			});

			// validate the form
			//
			this.validator = this.validate();
		},

		//
		// form validation methods
		//

		validate: function() {

			// validate package version profile form
			//
			this.packageVersionProfileForm.currentView.validate();

			// validate form
			//
			return this.$el.find('form').validate({

				rules: {},

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

		isValid: function() {
			return this.validator.form();
		},

		//
		// form methods
		//

		onClickArchive: function( e ){

			var self = this;

			if( self.options.package.hasValidExternalUrl() ){

				if(  self.$el.find('#use-external-url').length > 0 ){
					if( ! self.$el.find('#use-external-url').is(':checked') ){
						return true;
					}
				}

				var message = 'No File Required: You have already provided a valid URL from which to retrieve your code. If you wish to upload an archive instead, please clear the External URL field first.';
				if(  self.$el.find('#use-external-url').length > 0 ){
					message = 'No File Required: You have selected to retrieve your code from the External URL. If you wish to upload an archive instead, please clear the checkbox to use the External URL.';
				}

				e.preventDefault();
				Registry.application.modal.show( new NotifyView({
					title: 'No File Required',
					message: message
				}));
			}

		},

		onClickUseExternalUrl: function( e ){
			var self = this;
			self.$el.find('#archive').val('');
		},

		update: function(model) {
			this.packageVersionProfileForm.currentView.update(model);
		}
	});
});
