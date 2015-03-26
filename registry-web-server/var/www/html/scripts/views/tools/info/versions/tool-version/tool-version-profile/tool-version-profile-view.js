/******************************************************************************\
|                                                                              |
|                           tool-version-profile-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view of a tool versions's profile information.         |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'tooltip',
	'clickover',
	'text!templates/tools/info/versions/tool-version/tool-version-profile/tool-version-profile.tpl'
], function($, _, Backbone, Marionette, Tooltip, Clickover, Template) {
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