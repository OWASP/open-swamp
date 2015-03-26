/******************************************************************************\
|                                                                              |
|                         package-version-profile-form-view.js                 |
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
	'typeahead',
	'text!templates/packages/info/versions/info/details/package-version-profile/package-version-profile-form.tpl'
], function($, _, Backbone, Marionette, Validate, Tooltip, Clickover, Typeahead, Template) {
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

			// validate the form
			//
			this.validator = this.validate();
		},

		//
		// form validation methods
		//

		validate: function() {
			return this.$el.find("form").validate({

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

		update: function(model) {

			// get values from form
			//
			var versionString = this.$el.find('#version-string').val();
			var notes = this.$el.find('#notes').val();

			// update model
			//
			model.set({
				'version_string': versionString,
				'notes': notes
			});
		},
	});
});
