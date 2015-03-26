/******************************************************************************\
|                                                                              |
|                          schedule-profile-form-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an editable form view of a schedule's profile            |
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
	'text!templates/run-requests/schedules/profile/schedule-profile-form.tpl'
], function($, _, Backbone, Marionette, Validate, Tooltip, Clickover, Template) {
	return Backbone.Marionette.ItemView.extend({

		//
		// methods
		//

		initialize: function() {
			var self = this;

			// add unique name validation rule
			//
			$.validator.addMethod('uniqueName', function (value) { 
				return (value === self.model.get('name')) || self.collection.findRunRequestsByName(value).length === 0;
			}, 'The schedule name must be unique within a project.');
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, data);
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
		// form validation methods
		//

		validate: function() {
			return this.$el.find('form').validate({

				rules: {
					'name': {
						required: true,
						uniqueName: true
					},
					'description': {
						required: true
					}
				},

				messages: {
					'description': {
						required: "Please provide a short description of this schedule."
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
		},

		//
		// form methods
		//

		update: function(model) {

			// get values from form
			//
			var name = this.$el.find('#name').val();
			var description = this.$el.find('#description').val();

			// update model
			//
			model.set({
				'name': name,
				'description': description
			});
		}
	});
});