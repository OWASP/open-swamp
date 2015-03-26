/******************************************************************************\
|                                                                              |
|                                password-reset.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of password reset event.                         |
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

		urlRoot: Config.registryServer + '/password_resets',

		//
		// overridden Backbone methods
		//

		save: function(options) {
			$.ajax(_.extend(options, {
				url: this.url(),
				type: 'POST'
			}));
		},

		url: function() {
			return this.urlRoot + ( this.isNew()? '' : '/' + this.get('password_reset_key') + '/' + this.get('password_reset_id') );
		},

		isNew: function() {
			return !this.has('password_reset_key');
		}
	});
});
