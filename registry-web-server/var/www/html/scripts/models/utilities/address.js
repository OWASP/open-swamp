/******************************************************************************\
|                                                                              |
|                                   address.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of physical / geographical street address.       |
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
			'street-address1': undefined,
			'street-address2': undefined,
			'city': undefined,
			'state': undefined,
			'postal-code': undefined,
			'country': undefined
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

		toString: function() {
			return (
				(this.get('street-address1') || '')  + '$' +
				(this.get('street-address2') || '') + '$' +
				(this.get('city') || '') + '$' +
				(this.get('state') || '') + '$' +
				(this.get('postal-code') || '') + '$' +
				(this.get('country') || ''));
		},

		parse: function(response) {
			if (response) {
				var substrings = response.split('$');
				return {
					'street-address1': (substrings[0] != '' ? substrings[0] : undefined),
					'street-address2': (substrings[1] != '' ? substrings[1] : undefined),
					'city': (substrings[2] != '' ? substrings[2] : undefined),
					'state': (substrings[3] != '' ? substrings[3] : undefined),
					'postal-code': (substrings[4] != '' ? substrings[4] : undefined),
					'country': (substrings[5] != '' ? substrings[5] : undefined)
				};
			}
		}
	});
});