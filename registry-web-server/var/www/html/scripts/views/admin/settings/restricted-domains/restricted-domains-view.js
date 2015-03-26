/******************************************************************************\
|                                                                              |
|                                   settings-view.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for showing the system settings.                  |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/admin/settings/restricted-domains/restricted-domains.tpl',
	'scripts/registry',
	'scripts/models/admin/restricted-domain',
	'scripts/collections/admin/restricted-domains',
	'scripts/views/dialogs/error-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/admin/settings/restricted-domains/restricted-domains-list/restricted-domains-list-view'
], function($, _, Backbone, Marionette, Template, Registry, RestrictedDomain, RestrictedDomains, ErrorView, NotifyView, RestrictedDomainsListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		template: _.template(Template),

		regions: {
			restrictedDomainsList: '#restricted-domains-list'
		},

		events: {
			'click #add': 'onClickAdd',
			'click #save': 'onClickSave',
			'click #cancel': 'onClickCancel',
			'keyup .name' 	: 'onNameKeyup'
		},

		//
		// methods
		//

		initialize: function() {
			this.collection = new RestrictedDomains();
		},

		//
		// ajax methods
		//

		fetchRestrictedDomains: function(done) {
			this.collection.fetch({

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
							message: "Could not fetch restricted domains."
						})
					);
				}
			});
		},

		saveRestrictedDomains: function() {
			var self = this;

			/*
			this.collection.save({

				// callbacks
				//
				success: function() {

					// show success notification dialog
					//
					Registry.application.modal.show(
						new NotifyView({
							title: "Restricted Domain Changes Saved",
							message: "Your restricted domain changes have been successfully saved."
						})
					);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Your restricted domain changes could not be saved."
						})
					);
				}
			});
			*/

			// save restricted domains individually
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
										title: "Restricted Domain Changes Saved",
										message: "Your restricted domain changes have been successfully saved."
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
										message: "Your restricted domain changes could not be saved."
									})
								);
							}
						}
					});
				}
			}
			if (changes === 0) {

				// sho no changes notification dialog
				//
				Registry.application.modal.show(
					new NotifyView({
						message: "There are no new restricted domain changes to save."
					})
				);
			}
		},

		//
		// rendering methods
		//

		onRender: function() {
			var self = this;

			// fetch and show restricted domains
			//
			this.fetchRestrictedDomains(function() {
				self.restrictedDomainsList.show(
					new RestrictedDomainsListView({
						collection: self.collection,
						showDelete: true
					})
				);
			});
		},

		//
		// event handling methods
		//

		onClickAdd: function() {
			this.collection.add(new RestrictedDomain({}));

			// update list view
			//
			this.restrictedDomainsList.currentView.render();
		},
		
		onClickSave: function() {
			this.saveRestrictedDomains();
		},

		onClickCancel: function() {
			Backbone.history.navigate('#home', {
				trigger: true
			});
		},

		onNameKeyup: function(event) {
			var match = false;
			$('.name').each(function() {
				if (this.value !== event.currentTarget.value) {
					$(this).parent().removeClass('control-group error');
				}
				if ((event.currentTarget !== this) && (this.value === event.currentTarget.value)) {
					match = true;
					return false;
				}
			});
			if (match) {
				$(event.currentTarget).parent().addClass('control-group error');
				$('#save').attr('disabled','disabled');
			} else {
				$(event.currentTarget).parent().removeClass('control-group error');
				$('#save').removeAttr('disabled');
			}
		}
	});
});
