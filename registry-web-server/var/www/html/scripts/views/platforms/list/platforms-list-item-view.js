/******************************************************************************\
|                                                                              |
|                              platforms-list-item-view.js                     |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for displaying a single item belonging to         |
|        a list of platforms.                                                  |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/platforms/list/platforms-list-item.tpl',
	'scripts/registry',
	'scripts/utilities/date-format'
], function($, _, Backbone, Marionette, Template, Registry, DateFormat) {
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
				user: Registry.application.session.user,
				model: this.model,
				showDeactivatedPackages: this.options.showDeactivatedPackages,
				collection: this.collection
			}));
		}
	});
});
