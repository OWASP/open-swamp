/******************************************************************************\
|                                                                              |
|                                    file.js                                   |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of a file.                                       |
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
			'name': 'untitled'
		}
	});
});