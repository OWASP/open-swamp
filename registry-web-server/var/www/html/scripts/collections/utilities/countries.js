/******************************************************************************\
|                                                                              |
|                                    countries.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of countries.                          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config',
	'scripts/models/utilities/country'
], function($, _, Backbone, Config, Country) {
	return Backbone.Collection.extend({

		//
		// Backbone attributes
		//

		model: Country,
		url: Config.registryServer + '/countries'
	});
});