/******************************************************************************\
|                                                                              |
|                                tools-list-item-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for displaying a single item belonging to         |
|        a list of tools.                                                      |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/tools/list/tools-list-item.tpl',
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
				model: this.model,
				url: Registry.application.session.user? '#tools/' + this.model.get('tool_uuid'): undefined,
				showDelete: this.options.showDelete,
				showDeactivatedPackages: this.options.showDeactivatedPackages
			}));
		}
	});
});
