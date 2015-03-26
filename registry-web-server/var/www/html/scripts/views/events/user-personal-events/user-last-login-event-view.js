/******************************************************************************\
|                                                                              |
|                             user-last-login-event-view.js                    |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view that shows a user's personal event.               |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/events/user-personal-events/user-last-login-event.tpl'
], function($, _, Backbone, Marionette, Template) {
	return Backbone.Marionette.ItemView.extend({

		//
		// methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				date: this.model.get('date')
			}));
		}
	});
});