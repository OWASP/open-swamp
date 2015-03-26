/******************************************************************************\
|                                                                              |
|                           tool-version-profile-form-view.js                  |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an editable form view of a tool versions's               |
|        profile information.                                                  |
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
	'text!templates/tools/info/versions/tool-version/tool-version-profile/tool-version-profile-form.tpl'
], function($, _, Backbone, Marionette, Validate, Tooltip, Clickover, Template) {
	return Backbone.Marionette.ItemView.extend({

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
		},

		//
		// form methods
		//

		update: function(model) {

			// get values from form
			//
			var versionString = this.$el.find('#version-string').val();
			var toolDirectory = this.$el.find('#tool-directory').val();

			// get execution params
			//
			var toolExecutable = this.$el.find('#tool-executable').val();
			var toolArguments = this.$el.find('#tool-arguments').val();

			// get version notes
			//
			var notes = this.$el.find('#notes').val();

			// set model attributes
			//
			model.set({
				'version_string': versionString,
				'tool_directory': toolDirectory,

				// execution params
				//
				'tool_executable': toolExecutable,
				'tool_arguments': toolArguments,

				// version notes
				//
				'notes': notes
			});
		},

		//
		// form validation methods
		//

		validate: function() {
			return this.$el.find('form').validate({

				rules: {
					'description': {
						required: true
					}
				},

				messages: {
					'description': {
						required: "Please provide a short description of your tool."
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

		isValid: function() {
			return this.validator.form();
		}
	});
});