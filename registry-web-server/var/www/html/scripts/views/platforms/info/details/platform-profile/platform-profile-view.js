/******************************************************************************\
|                                                                              |
|                               platform-profile-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view of a platform's profile information.              |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/platforms/info/details/platform-profile/platform-profile.tpl'
], function($, _, Backbone, Marionette, Template) {
	return Backbone.Marionette.ItemView.extend({

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model
			}));
		}
	});
});
