/******************************************************************************\
|                                                                              |
|                                     contact.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an instance of contact / question.                       |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config',
	'scripts/models/utilities/timestamped',
	'scripts/models/utilities/phone-number'
], function($, _, Backbone, Config, Timestamped, PhoneNumber) {
	return Backbone.Model.extend({

		//
		// attributes
		//

		defaults: {
			'first_name': undefined,
			'last_name': undefined,
			'email': undefined,
			'phone': undefined,
			'affiliation': undefined
		},

		//
		// Backbone attributes
		//

		urlRoot: Config.registryServer + '/contacts',

		//
		// overridden Backbone methods
		//

		initialize: function() {
			if (this.isNew()) {
				this.set({
					'phone': new PhoneNumber()
				});
			}
		},

		url: function() {
			return this.urlRoot + (this.isNew()? '' : '/' + this.get('contact_id'));
		},

		isNew: function() {
			return !this.has('contact_id');
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