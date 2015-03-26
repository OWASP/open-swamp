/******************************************************************************\
|                                                                              |
|                            system-email-list-view.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for showing the system email users.               |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/admin/settings/system-email/system-email-list/system-email-list.tpl',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/admin/settings/system-email/system-email-list/system-email-list-item-view'
], function($, _, Backbone, Marionette, Template, SortableTableListView, SystemEmailListItemView) {
	return SortableTableListView.extend({

		//
		// attributes
		//

		childView: SystemEmailListItemView,

		sorting: {

			// disable sorting on remove column
			//
			headers: { 
				2: { 
					sorter: false 
				}
			},

			// sort on name column in ascending order 
			//
			sortList: [[0, 0]]
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				collection: this.collection
			}));
		}
	});
});
