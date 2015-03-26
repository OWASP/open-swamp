/******************************************************************************\
|                                                                              |
|                               restricted-domain.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an instance of a restricted domain, which may            |
|        not be used for user email verifiation.                               |
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

		urlRoot: Config.registryServer + '/restricted-domains',

		//
		// overridden Backbone methods
		//

		url: function() {
			return this.urlRoot + (this.isNew()? '' : '/' + this.get('restricted_domain_id'));
		},

		isNew: function() {
			return !this.has('restricted_domain_id');
		}
	});
});
