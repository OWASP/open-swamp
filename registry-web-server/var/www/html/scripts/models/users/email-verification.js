/******************************************************************************\
|                                                                              |
|                              email-verification.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of user account email verification.              |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'scripts/config',
	'scripts/models/utilities/timestamped'
], function($, _, Config, Timestamped) {
	return Timestamped.extend({

		//
		// Backbone attributes
		//

		urlRoot: Config.registryServer + '/verifications',

		//
		// ajax methods
		//

		verify: function(options) {
			$.ajax(_.extend(options, {
				url: this.urlRoot + '/verify/' + this.get('verification_key'),
				type: 'PUT'
			}));
		},

		resend: function(username, password, options) {
			$.ajax(_.extend(options, {
				url: Config.registryServer + '/verifications/resend',
				type: 'POST',
				data: {
					'username': username,
					'password': password
				}
			}));
		},

		//
		// overridden Backbone methods
		//

		url: function() {
			return this.urlRoot + (this.isNew()? '' : '/' + this.get('verification_key'));
		},

		isNew: function() {
			return !this.has('verification_key');
		}
	});
});