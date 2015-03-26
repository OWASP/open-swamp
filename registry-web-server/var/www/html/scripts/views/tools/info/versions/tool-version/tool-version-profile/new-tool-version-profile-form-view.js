/******************************************************************************\
|                                                                              |
|                       new-tool-version-profile-form-view.js                  |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an editable form view of a new tool versions's           |
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
	'text!templates/tools/info/versions/tool-version/tool-version-profile/new-tool-version-profile-form.tpl',
	'scripts/views/tools/info/versions/tool-version/tool-version-profile/tool-version-profile-form-view'
], function($, _, Backbone, Marionette, Validate, Template, ToolVersionProfileFormView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			toolVersionProfileForm: '#tool-version-profile-form'
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

			// show subview
			//
			this.toolVersionProfileForm.show(
				new ToolVersionProfileFormView({
					model: this.model
				})
			);

			// validate the form
			//
			this.validator = this.validate();
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
			return this.validator.form() && this.toolVersionProfileForm.currentView.isValid();
		},

		//
		// form methods
		//

		update: function(model) {
			this.toolVersionProfileForm.currentView.update(model);
		}
	});
});