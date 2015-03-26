/******************************************************************************\
|                                                                              |
|                        linked-accounts-list-item-view.js                     |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for showing a single permission item.             |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/users/info/linked-accounts/linked-accounts-list/linked-accounts-list-item.tpl',
	'scripts/registry',
	'scripts/config',
	'scripts/models/linked-accounts/user-linked-account',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
], function($, _, Backbone, Marionette, Template, Registry, Config, UserLinkedAccount, ConfirmView, NotifyView, ErrorView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		tagName: 'tr',

		events: {
			'click .delete': 'onClickDelete',
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, { 
				admin: Registry.application.session.user.get('admin_flag') == '1',
				account: data,
				showDelete: this.options.showDelete
			});
		},

		//
		// event handling methods
		//

		onClickDelete: function() {
			var self = this;

			// show confirm dialog
			//
			Registry.application.modal.show(
				new ConfirmView({
					title: "Unlink Account",
					message: "Are you sure you wish to unlink this " + self.model.get('title') + " account?",

					// callbacks
					//
					accept: function() {
						var account = new UserLinkedAccount({
							'linked_account_id': self.model.get('linked_account_id')
						});

						account.destroy({

							// callbacks
							//
							success: function() {

								// show success notify view
								//
								Registry.application.modal.show(
									new NotifyView({
										message: "The account has been successfully unlinked.",
										accept: function(){
											self.options.parent.render();
										}
									})
								);
							},

							error: function() {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Could not unlink this account."
									})
								);
							}
						});
					}
				})
			);
		}
	});
});
