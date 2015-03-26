/******************************************************************************\
|                                                                              |
|                                   help-view.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the help/information view of the application.            |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/info/help.tpl',
	'scripts/registry',
], function($, _, Backbone, Marionette, Template, Registry) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		template: _.template(Template)
	});
});
