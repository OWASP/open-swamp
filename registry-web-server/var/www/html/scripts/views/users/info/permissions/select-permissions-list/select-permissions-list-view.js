/******************************************************************************\
|                                                                              |
|                             select-permissions-list-view.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a user's current list of.           |
|        permissions.                                                          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'tablesorter',
	'text!templates/users/info/permissions/select-permissions-list/select-permissions-list.tpl',
	'scripts/registry',
	'scripts/collections/permissions/user-permissions',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/users/info/permissions/select-permissions-list/select-permissions-list-item-view'
], function($, _, Backbone, Marionette, TableSorter, Template, Registry, UserPermissions, SortableTableListView, SelectPermissionsListItemView) {
	return SortableTableListView.extend({

		//
		// attributes
		//

		childView: SelectPermissionsListItemView,

		sorting: {

			// disable sorting on delete column
			//
			headers: { 
				4: { 
					sorter: false 
				},
				5: { 
					sorter: false 
				}
			},

			// sort on name in ascending order 
			//
			sortList: [[0, 0]]
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				admin: Registry.application.session.user.get('admin_flag') == '1',
				collection: this.collection
			}));
		},

		childViewOptions: function() { 
			return { 
				parent: this.options.parent
			};
		}
	});
});
