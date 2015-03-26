/******************************************************************************\
|                                                                              |
|                                 phone-number.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of an international phone number.                |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone'
], function($, _, Backbone) {
	return Backbone.Model.extend({

		//
		// attributes
		//

		defaults: {
			'country-code': undefined,
			'area-code': undefined,
			'phone-number': undefined
		},

		//
		// query methods
		//

		hasAttributes: function() {
			for (var attribute in this.attributes) {
				if (this.has(attribute)) {
					return true;
				}
			}
			return false;
		},

		//
		// overridden Backbone methods
		//

		initialize: function(attributes) {
			if (attributes) {
				this.set({
					'country-code': attributes['country-code'],
					'area-code': attributes['area-code'],
					'phone-number': attributes['phone-number']
				});
			}
		},

		toString: function() {
			if (this.has('country-code') || this.has('area-code')) {
				var countryCode = this.get('country-code') || '';
				var areaCode = this.get('area-code') || '';
				var phoneNumber = this.get('phone-number') || '';

				// concatenate into string
				//
				return countryCode + ' ' + areaCode + ' ' + phoneNumber;
			} else {
				return this.get('phone-number');
			}
		},

		parse: function(response) {
			if (response && typeof(response) === 'string') {
				var substrings = response.split(' ');
				if (substrings.length >= 3) {
					return {
						'country-code': (substrings[0] != '' ? substrings[0] : undefined),
						'area-code': (substrings[1] != '' ? substrings[1] : undefined),
						'phone-number': (substrings[2] != '' ? substrings[2] : undefined)
					};
				} else {
					return {
						'phone-number': (substrings[0] != '' ? substrings[0] : undefined)
					};
				}
			} else {
				return response
			}
		}
	});
});