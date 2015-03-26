/******************************************************************************\
|                                                                              |
|                        new-contact-profile-form-view.js                      |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the about/information view of the application.           |
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
	'text!templates/contacts/contact-profile/new-contact-profile-form.tpl',
	'scripts/registry',
	'scripts/widgets/accordions',
	'scripts/models/contacts/contact'
], function($, _, Backbone, Marionette, Validate, Tooltip, Clickover, Template, Registry, Accordions, Contact) {
	return Backbone.Marionette.ItemView.extend({

		//
		// methods
		//

		initialize: function() {
			this.model = new Contact();
			
			// set contact to current user
			//
			if (Registry.application.session.user) {
				this.model.setUser(Registry.application.session.user);
			}

			// add numeric only validation rule
			//
			$.validator.addMethod('numericOnly', function (value) {
				return (value === '') || (/^[0-9]+$/.test(value));
			}, 'Please only enter numeric values (0-9)');

			// add numeric or dashes only validation rule (for phone numbers)
			//
			$.validator.addMethod('numericOrDashesOnly', function (value) {
				return (value === '') || (/^[0-9,-]+$/.test(value));
			}, 'Please only enter numeric values (0-9)');
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

			// change accordion icon
			//
			new Accordions(this.$el.find('.accordion'));

			// validate form
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

				messages: {
					'first-name': {
						required: "Enter your given / first name"
					},
					'last-name': {
						required: "Enter your family / last name"
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
		// form processing methods
		//

		update: function(model) {

			// get values from form
			//
			var firstName = this.$el.find('#first-name').val();
			var lastName = this.$el.find('#last-name').val();
			var email = this.$el.find('#email').val();
			var subject = this.$el.find('#subject').val();
			var question = this.$el.find('#question').val();

			// update model
			//
			model.set({
				'first_name': firstName,
				'last_name': lastName,
				'email': email,
				'subject': subject,
				'question': question
			});
		}
	});
});
