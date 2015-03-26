/******************************************************************************\
|                                                                              |
|                            linked-accounts-list-view.js                      |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a user's current list of.           |
|        linked-accounts.                                                      |
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
	'text!templates/users/info/linked-accounts/linked-accounts-list/linked-accounts-list.tpl',
	'scripts/registry',
	'scripts/config',
	'scripts/collections/linked-accounts/user-linked-accounts',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/users/info/linked-accounts/linked-accounts-list/linked-accounts-list-item-view',
], function($, _, Backbone, Marionette, TableSorter, Template, Registry, Config, UserPermissions, NotifyView, ErrorView, SortableTableListView, LinkedAccountsListItemView) {
	return SortableTableListView.extend({

		//
		// attributes
		//
		events: {
			'change select.status': 'onChangeStatus'
		},

		childView: LinkedAccountsListItemView,

		sorting: {

			// disable sorting on delete column
			//
			headers: { 
				3: { 
					sorter: false 
				},
				4: { 
					sorter: false 
				}
			},

			// sort on name in ascending order 
			//
			sortList: [[1, 0]]
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				admin: Registry.application.session.user.get('admin_flag') == '1',
				collection: this.collection,
				showDelete: this.options.showDelete
			}));
		},

		childViewOptions: function(){
			return {
				parent: this.options.parent,
				showDelete: this.options.showDelete
			};
		},

		//
		// event handling methods
		//

		onChangeStatus: function( e ){
			var id = $(e.target).data('linked_account_id');
			$.ajax({
				url: Config.registryServer + '/linked-accounts/' + id + '/enabled',
				type: 'POST',
				data: {
					enabled_flag: e.target.value
				},
				success: function(res){
					// show success notify view
					//
					Registry.application.modal.show(
						new NotifyView({
							message: "Linked account status updated!.",
							accept: function(){
							}
						})
					);
				},
				error: function(res){
					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not update this linked account's status."
						})
					);
				}
			});
		}
	});
});
