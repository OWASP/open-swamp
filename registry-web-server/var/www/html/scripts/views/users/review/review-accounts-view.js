/******************************************************************************\
|                                                                              |
|                             review-accounts-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for reviewing, accepting, or declining            |
|        user account approval.                                                |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/users/review/review-accounts.tpl',
	'scripts/registry',
	'scripts/widgets/accordions',
	'scripts/collections/users/users',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/users/filters/user-filters-view',
	'scripts/views/users/review/review-accounts-list/review-accounts-list-view'
], function($, _, Backbone, Marionette, Template, Registry, Accordions, Users, NotifyView, ErrorView, UserFiltersView, ReviewAccountsListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			userFilters: '#user-filters',
			reviewAccountsList: '#review-accounts-list'
		},

		events: {
			'click #save': 'onClickSave',
			'click #cancel': 'onClickCancel',
			'click #show-disabled-accounts': 'onClickShowDisabledAccounts',
			'click #show-numbering': 'onClickShowNumbering'
		},

		//
		// methods
		//

		initialize: function() {
			this.collection = new Users();
		},

		showDisabledAccounts: function() {
			return this.$el.find('#show-disabled-accounts').is(':checked');
		},

		fetchAccounts: function(done) {
			// fetch user accounts
			//
			this.collection.fetchAll({
				data: this.userFilters.currentView? this.userFilters.currentView.getData() : null,

				// callbacks
				//
				success: function() {
					done();
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not load users."
						})
					);
				}
			});
		},

		saveAccounts: function() {
			var self = this;

			// save users individually
			//
			var successes = 0, errors = 0, changes = 0;
			for (var i = 0; i < this.collection.length; i++) {
				var model = this.collection.at(i);

				if (model.hasChanged()) {
					changes++;
					model.save(undefined, {

						// callbacks
						//
						success: function() {
							successes++;

							// report success when completed
							//
							if (i === self.collection.length && successes === changes) {

								// show success notification dialog
								//
								Registry.application.modal.show(
									new NotifyView({
										title: "User Account Changes Saved",
										message: "Your user account changes have been successfully saved."
									})
								);
							}
						},

						error: function() {
							errors++;

							// report first error
							//
							if (errors === 1) {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Your user account changes could not be saved."
									})
								);
							}
						}
					});
				}
			}
			if (changes === 0) {

				// show no changes notification dialog
				//
				Registry.application.modal.show(
					new NotifyView({
						message: "There are no new user account changes to save."
					})
				);
			}

			/*
			// save user accounts
			//
			this.collection.save({

				// callbacks
				//
				success: function() {

					// show success notification dialog
					//
					Registry.application.modal.show(
						new NotifyView({
							title: "User Account Changes Saved",
							message: "Your user account changes have been successfully saved."
						})
					);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Your user account changes could not be saved."
						})
					);
				}
			});
			*/
		},

		//
		// rendering methods
		//

		template: function(){
			return _.template(Template,{
				showDisabledAccounts: this.options.showDisabledAccounts ? true : false,
				showNumbering: Registry.application.getShowNumbering()
			});
		},

		onRender: function() {
			var self = this;

			// change accordion icon
			//
			new Accordions(this.$el.find('.accordion'));

			// show user filters view
			//
			this.userFilters.show(
				new UserFiltersView({
					model: this.model,
					data: this.options.data? this.options.data : {},

					// callbacks
					//
					onChange: function() {
						setQueryString(self.userFilters.currentView.getQueryString());			
					}
				})
			);

			// fetch and show accounts
			//
			this.fetchAccounts(function() {
				self.showAccountsList();
			});
		},

		showAccountsList: function() {

			// show review user accounts list
			//
			this.reviewAccountsList.show(
				new ReviewAccountsListView({
					collection: this.collection,
					showDisabledAccounts: this.showDisabledAccounts(),
					showNumbering: Registry.application.getShowNumbering()
				})
			);
		},

		//
		// event handling methods
		//

		onClickSave: function() {
			this.saveAccounts();
		},

		onClickCancel: function() {

			// go home
			//
			Backbone.history.navigate('#home', {
				trigger: true
			});
		},

		onClickShowDisabledAccounts: function() {
			this.reviewAccountsList.currentView.options.showDisabledAccounts = this.showDisabledAccounts();
			this.reviewAccountsList.currentView.render();
		},

		onClickShowNumbering: function(event) {
			Registry.application.setShowNumbering($(event.target).is(':checked'));
			this.showAccountsList();
		}
	});
});
