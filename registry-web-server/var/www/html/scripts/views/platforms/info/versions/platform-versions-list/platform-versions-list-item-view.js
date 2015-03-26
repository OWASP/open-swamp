/******************************************************************************\
|                                                                              |
|                         platform-versions-list-item-view.js                  |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for showing a platform versions list item.        |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/platforms/info/versions/platform-versions-list/platform-versions-list-item.tpl',
	'scripts/registry'
], function($, _, Backbone, Marionette, Template, Registry) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		tagName: 'tr',

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model,
				url: Registry.application.session.user? Registry.application.getURL() + '#platforms/versions/' + this.model.get('platform_version_uuid') : undefined,
				showDelete: false
			}));
		}
	});
});