/******************************************************************************\
|                                                                              |
|                               restricted-domains.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of restricted domains.                 |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config',
	'scripts/models/admin/restricted-domain'
], function($, _, Backbone, Config, RestrictedDomain) {
	return Backbone.Collection.extend({

		//
		// Backbone attributes
		//

		model: RestrictedDomain,
		url: Config.registryServer + '/restricted-domains',

		//
		// methods
		//

		// allow bulk saving of projects
		//
		save: function(options) {
			this.sync('update', this, options);
		}
	});
});