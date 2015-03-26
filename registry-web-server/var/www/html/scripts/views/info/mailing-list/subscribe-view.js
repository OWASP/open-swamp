/******************************************************************************\
|                                                                              |
|                                  subscribe-view.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the a view for subscribing to our mailing list.          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/info/mailing-list/subscribe.tpl'
], function($, _, Backbone, Marionette, Template) {
	return Backbone.Marionette.ItemView.extend({

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, data);
		},

		onRender: function() {

			// scroll to top
			//
			$(document).scrollTop(0);
		}
	});
});
