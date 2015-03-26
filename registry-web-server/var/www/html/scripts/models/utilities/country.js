/******************************************************************************\
|                                                                              |
|                                     country.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an instance of model of a country.                       |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config'
], function($, _, Backbone, Config) {
	return Backbone.Model.extend({

		//
		// Backbone attributes
		//

		urlRoot: Config.registryServer + '/countries',

		//
		// overridden Backbone methods
		//

		url: function() {
			return this.urlRoot + (this.isNew()? '' : '/' + this.get('country_id'));
		},

		isNew: function() {
			return !this.has('country_id');
		}
	});
});