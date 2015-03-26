/******************************************************************************\
|                                                                              |
|                                      event.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an instance of a generic event type.                     |
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

		date: undefined
	});
});