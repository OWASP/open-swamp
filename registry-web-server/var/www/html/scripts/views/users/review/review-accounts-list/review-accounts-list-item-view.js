/******************************************************************************\
|                                                                              |
|                           review-accounts-list-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for displaying a list of user accounts            |
|        for review.                                                           |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'dropdown',
	'text!templates/users/review/review-accounts-list/review-accounts-list-item.tpl',
	'scripts/registry',
	'scripts/utilities/date-format',
	'scripts/views/dialogs/error-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/confirm-view'
], function($, _, Backbone, Marionette, Dropdown, Template, Registry, DateFormat, ErrorView, NotifyView, ConfirmView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		tagName: 'tr',

		events: {
			'click a.pending': 'onClickPending',
			'click a.enabled': 'onClickEnabled',
			'click a.disabled': 'onClickDisabled',
			'click a.owner-pending': 'onClickOwnerPending',
			'click a.owner-approved': 'onClickOwnerApproved',
			'click a.owner-denied': 'onClickOwnerDenied'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model,
				index: this.options.index + 1,
				url: Registry.application.getURL() + '#accounts/' + this.model.get('user_uid'),
				showDisabledAccounts: this.options.showDisabledAccounts,
				showNumbering: this.options.showNumbering
			}));
		},

		//
		// event handling methods
		//

		onClickPending: function() {
			this.model.setStatus('pending');
			this.render();
		},

		onClickOwnerPending: function() {
			this.model.setOwnerStatus('pending');
			this.render();
		},

		onClickEnabled: function() {
			this.model.setStatus('enabled');
			this.render();
		},

		onClickOwnerApproved: function() {
			this.model.setOwnerStatus('approved');
			this.render();
		},

		onClickDisabled: function() {
			this.model.setStatus('disabled');
			this.render();
		},

		onClickOwnerDenied: function() {
			this.model.setOwnerStatus('denied');
			this.render();
		},

		onClickDelete: function() {
			var self = this;

			// show confirm delete dialog
			//
			Registry.application.modal.show(
				new ConfirmView({
					title: "Delete User Account",
					message: "Are you sure that you would like to delete " +
						this.model.getFullName() + "'s user account? " +
						"When you delete an account, all of the user data will continue to be retained.",

					// callbacks
					//
					accept: function() {
						self.model.setStatus('disabled');

						// update view
						//
						self.render();

						// save user
						//
						self.model.save(undefined, {

							// callbacks
							//
							success: function() {

								// show success notification dialog
								//
								Registry.application.modal.show(
									new NotifyView({
										message: "This user account has been successfuly disabled."
									})
								);
							},

							error: function() {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Could not delete this user account."
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
