/******************************************************************************\
|                                                                              |
|                         restricted-domains-list-view.js                      |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for showing the domains that are restricted       |
|        for use for user verification.                                        |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/admin/settings/restricted-domains/restricted-domains-list/restricted-domains-list.tpl',
	'scripts/views/widgets/lists/table-list-view',
	'scripts/views/admin/settings/restricted-domains/restricted-domains-list/restricted-domains-list-item-view'
], function($, _, Backbone, Marionette, Template, TableListView, RestrictedDomainsListItemView) {
	return TableListView.extend({

		//
		// attributes
		//

		childView: RestrictedDomainsListItemView,

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				collection: this.collection,
				showDelete: this.options.showDelete
			}));
		},

		childViewOptions: function() {
			return {
				showDelete: this.options.showDelete
			}
		}
	});
});
