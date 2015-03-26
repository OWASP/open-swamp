/******************************************************************************\
|                                                                              |
|                                   resources-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines related resources for the application.                   |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/info/resources.tpl'
], function($, _, Backbone, Marionette, Template) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//
		
		template: _.template(Template)
	});
});
