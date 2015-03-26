/******************************************************************************\
|                                                                              |
|                                   contact.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of an instance of contact / feedback.            |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'scripts/config',
	'scripts/models/utilities/timestamped',
	'scripts/models/utilities/phone-number'
], function($, _, Config, Timestamped, PhoneNumber) {
	return Timestamped.extend({

		//
		// Backbone attributes
		//

		urlRoot: Config.registryServer + '/contacts',

		//
		// methods
		//

		setUser: function(user) {
			this.set({
				'first_name': user.get('first_name'),
				'last_name': user.get('last_name'),
				'email': user.get('email')
			});
		},

		hasName: function() {
			return this.has('first_name') || this.has('last_name');
		},

		hasFullName: function() {
			return this.has('first_name') && this.has('last_name');
		},
		
		getFullName: function() {
			return this.hasName()? this.get('first_name') + ' ' + this.get('last_name') : '';
		},

		//
		// overridden Backbone methods
		//

		url: function() {
			return this.urlRoot + (this.isNew()? '' : '/' + this.get('contact_uuid'));
		},

		isNew: function() {
			return !this.has('contact_uuid');
		},

		parse: function(response) {

			// call superclass method
			//
			var JSON = Timestamped.prototype.parse.call(this, response);

			// parse subfields
			//
			JSON.phone = new PhoneNumber(
				PhoneNumber.prototype.parse(response.phone)
			);

			return JSON;
		},

		toJSON: function() {

			// call superclass method
			//
			var JSON = Timestamped.prototype.toJSON.call(this);

			// convert subfields
			//
			if (this.has('phone')) {
				JSON.phone = this.get('phone').toString();
			}

			return JSON;
		}
	});
});