/******************************************************************************\
|                                                                              |
|                             user-profile-form-view.js                        |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an editable form view of the user's profile              |
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
	'text!templates/users/user-profile/user-profile-form.tpl',
	'scripts/views/widgets/selectors/country-selector-view'
], function($, _, Backbone, Marionette, Validate, Tooltip, Clickover, Template, CountrySelectorView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			countrySelector: '#country-selector'
		},

		events: {
			'blur #email': 'onBlurEmail'
		},

		//
		// methods
		//

		initialize: function() {
			var self = this;

			// add numeric only validation rule
			//
			$.validator.addMethod('numericOnly', function (value, element) { 

				// allow empty values for optional fields
				//
				if (value == '') {
					return !$(element).hasClass('required');
				}

				return (/^[0-9]+$/.test(value));
			}, 'Please only enter numeric values (0-9)');

			// add numeric or dashes only validation rule (for phone numbers)
			//
			$.validator.addMethod('numericOrDashesOnly', function (value, element) {

				// allow empty values for optional fields
				//
				if (value == '') {
					return !$(element).hasClass('required');
				}

				return (/^[0-9,-]+$/.test(value));
			}, 'Please only enter numeric values (0-9)');

			// add alpha only validation rule
			//
			$.validator.addMethod('alphaOnly', function (value, element) {

				// allow empty values for optional fields
				//
				if (value == '') {
					return !$(element).hasClass('required');
				}

				return (/^[-\sa-zA-Z]+$/.test(value));
			}, 'Please only enter alphabet characters (letters, hyphens, and spaces)');

			// add alphanumeric validation rule
			//
			$.validator.addMethod('alphaNumericOnly', function (value, element) {

				// allow empty values for optional fields
				//
				if (value == '') {
					return !$(element).hasClass('required');
				}

				return (/^[0-9\sa-zA-Z]+$/.test(value));
			}, 'Please only enter alphabet characters (letters, hyphens, and spaces) or numbers');

			// add ITU E.164 phone number validation rule
			//
			$.validator.addMethod('ITUE164format', function (value, element) {
				if (self.isUnitedStates()) {
					return true;
				} else {

					// allow empty values for optional fields
					//
					if (value == '') {
						return !$(element).hasClass('required');
					}

					var countryCode = self.$el.find('#country-code').val();
					var areaCode = self.$el.find('#area-code').val();
					var phoneNumber = self.$el.find('#phone-number').val();
					var number = countryCode + areaCode + phoneNumber;
					var numberWithoutSymbols = number.replace(/\D/g,'');
					return numberWithoutSymbols.length <= 15;
				}
			}, 'Country + Area + Phone # can\'t be longer than 15 digits');

			// add 3 + 7 phone number validation rule
			//
			$.validator.addMethod('usPhoneCheck', function (value, element) {
				if (self.isUnitedStates()) {

					// allow empty values for optional fields
					//
					if (value == '') {
						return !$(element).hasClass('required');
					}

					var phoneNumber = self.$el.find('#phone-number').val();
					var numberWithoutSymbols = phoneNumber.replace(/\D/g,'');
					return numberWithoutSymbols.length == 7;
				} else {
					return true;
				}
			}, 'U.S. phone number must be 7 digits long');

			// add U.S. area code validation rule
			//
			$.validator.addMethod('usAreaCheck', function (value, element) {
				if (self.isUnitedStates()) {

					// allow empty values for optional fields
					//
					if (value == '') {
						return !$(element).hasClass('required');
					}

					var areaCode = self.$el.find('#area-code').val();
					return areaCode.length == 3;
				} else {
					return true;
				}
			}, 'U.S. area code must be 3 digits long');
		},

		isUnitedStates: function() {
			var countryCode = this.$el.find('#country-code').val();
			return countryCode == '1';
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

			// show country selector
			//
			this.countrySelector.show(
				new CountrySelectorView({
					initialValue: this.model.get('address').get('country')
				})
			);

			// add country selector callback
			//
			var self = this;
			this.countrySelector.currentView.onclickmenuitem = function() {
				var country = self.countrySelector.currentView.getSelected();
				var countryCode = country.get('phone_code');

				// set default phone code
				//
				self.model.get('phone').set({
					'country-code': countryCode
				});
				self.$el.find('#country-code').val(countryCode);
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
		// form validation methods
		//

		validate: function() {
			return this.$el.find('form').validate({

				rules: {
					'confirm-email': {
						required: true,
						equalTo: '#email'
					},
					'postal-code': {
						alphaNumericOnly: true
					},
					'country-code': {
						numericOnly: true
					},
					'area-code': {
						numericOnly: true,
						usAreaCheck: true
					},
					'phone-number': {
						numericOrDashesOnly: true,
				   		usPhoneCheck: true,
						ITUE164format: true
					}
				},

				messages: {
					'first-name': {
						required: "Enter your given / first name"
					},
					'last-name': {
						required: "Enter your family / last name"
					},
					'preferred-name': {
						required: "Enter your preferred / nickname"
					},
					'email': {
						required: "Enter a valid email address",
						email: "This email address is not valid"
					},
					'confirm-email': {
						required: "Re-enter your email address",
						equalTo: "Retype the email address above"
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
			var firstName = this.$el.find('#first-name').val();
			var lastName = this.$el.find('#last-name').val();
			var preferredName = this.$el.find('#preferred-name').val();
			var email = this.$el.find('#email').val();
			var streetAddress1 = this.$el.find('#street-address1').val();
			var streetAddress2 = this.$el.find('#street-address2').val();
			var city = this.$el.find('#city').val();
			var state = this.$el.find('#state').val();
			var postalCode = this.$el.find('#postal-code').val();
			var country = this.countrySelector.currentView.getSelectedName();
			var countryCode = this.$el.find('#country-code').val();
			var areaCode = this.$el.find('#area-code').val();
			var phoneNumber = this.$el.find('#phone-number').val();
			var affiliation = this.$el.find('#affiliation').val();

			// update model
			//
			model.set({
				'first_name': firstName,
				'last_name': lastName,
				'preferred_name': preferredName,
				'affiliation': affiliation != '' ? affiliation : undefined,
				'email': email
			});

			// update phone numer
			//
			model.get('phone').set({
				'country-code': countryCode != '' ? countryCode : undefined,
				'area-code': areaCode != '' ? areaCode : undefined,
				'phone-number': phoneNumber != '' ? phoneNumber : undefined
			});

			// update address
			//
			model.get('address').set({
				'street-address1': streetAddress1 != '' ? streetAddress1 : undefined,
				'street-address2': streetAddress2 != '' ? streetAddress2 : undefined,
				'city': city != '' ? city : undefined,
				'state': state != '' ? state : undefined,
				'postal-code': postalCode != '' ? postalCode : undefined,
				'country': country != '' ? country : undefined
			});
		},


		/* Duplicate from new user profile form view */
		onBlurEmail: function(event) {
			var element = $(event.currentTarget);
			var email = event.currentTarget.value;

			if (email !== '' && email !== ' ' && email !== this.model.get('email')) {

				// check for username uniqueness
				//
				var response = this.model.checkValidation({
						'email': email
					}, {

					// callbacks
					//
					error: function() {
						var error = JSON.parse(response.responseText)[0];
						error = error.substr(0,1).toUpperCase() + error.substr(1);
						element.closest('.control-group').removeClass('success').addClass('error');
						element.closest('.control-group').find('.error').removeClass('valid');
						element.closest('.control-group').find('label.error').html(error);
					}
				});
			}
		}
	});
});
