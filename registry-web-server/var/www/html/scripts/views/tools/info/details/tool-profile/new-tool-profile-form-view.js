/******************************************************************************\
|                                                                              |
|                            new-tool-profile-form-view.js                     |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an editable form view of a tool's profile                |
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
	'text!templates/tools/info/details/tool-profile/new-tool-profile-form.tpl',
	'scripts/views/tools/info/versions/tool-version/tool-version-profile/new-tool-version-profile-form-view'
], function($, _, Backbone, Marionette, Validate, Tooltip, Clickover, Template, NewToolVersionProfileFormView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			newToolVersionProfileForm: '#new-tool-version-profile-form'
		},

		//
		// methods
		//

		initialize: function() {

			// add tool name validation
			//
			$.validator.addMethod('validToolName', function() {

				// check to make sure that tool name is unique
				//
				return true;
				
			}, "Tool name must be unique.");
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

			// display tooltips on focus
			//
			this.$el.find('input, textarea').popover({
				trigger: 'focus'
			});

			// validate the form
			//
			this.validator = this.validate();

			// show tool version profile form
			//
			this.newToolVersionProfileForm.show(
				new NewToolVersionProfileFormView({
					model: this.options.toolVersion
				})
			);
		},

		//
		// form validation methods
		//

		validate: function() {
			return this.$el.find('form').validate({

				rules: {
					'name': {
						required: true,
						validToolName: true
					}
				},

				messages: {
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

		isValid: function() {
			return this.validator.form();
		},

		//
		// form methods
		//

		update: function(model, version) {

			// get values from form
			//
			var name = this.$el.find('#name').val();

			// update model
			//
			model.set({
				'name': name
			});

			// update version
			//
			this.newToolVersionProfileForm.currentView.update(version);
		}
	});
});
