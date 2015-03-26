/******************************************************************************\
|                                                                              |
|                             review-packages-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for reviewing, accepting, or declining            |
|        package approval.                                                     |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/packages/review/review-packages.tpl',
	'scripts/registry',
	'scripts/utilities/query-strings',
	'scripts/utilities/url-strings',
	'scripts/widgets/accordions',
	'scripts/collections/packages/packages',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/packages/filters/review-packages-filters-view',
	'scripts/views/packages/review/review-packages-list/review-packages-list-view'
], function($, _, Backbone, Marionette, Template, Registry, QueryStrings, UrlStrings, Accordions, Projects, NotifyView, ErrorView, ReviewPackagesFiltersView, ReviewPackagesListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			packageFilters: '#package-filters',
			reviewPackagesList: '#review-packages-list'
		},

		events: {
			'click #save': 'onClickSave',
			'click #cancel': 'onClickCancel',
			'click #show-deactivated-packages': 'onClickShowDeactivatedPackages',
			'click #show-numbering': 'onClickShowNumbering'
		},

		//
		// methods
		//

		initialize: function() {
			this.collection = new Projects();
		},

		//
		// ajax methods
		//

		fetchPackages: function(done) {
			var self = this;

			// fetch packages
			//
			this.collection.fetchAll({
				data: this.packageFilters.currentView? this.packageFilters.currentView.getData() : null,

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
							message: "Could not load packages."
						})
					);
				}
			});
		},

		savePackages: function() {
			var self = this;

			// save packages collectively
			//
			/*
			this.collection.save({

				// callbacks
				//
				success: function() {

					// show success notify view
					//
					Registry.application.modal.show(
						new NotifyView({
							title: "Package Changes Saved",
							message: "Your package changes have been successfully saved."
						})
					);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Your package changes could not be saved."
						})
					);
				}
			});
			*/

			// save packages individually
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
								Registry.application.modal.show(
									new NotifyView({
										title: "Package Changes Saved",
										message: "Your package changes have been successfully saved."
									})
								);
							}
						},

						error: function() {
							errors++;

							// report first error
							//
							if (errors === 1) {
								Registry.application.modal.show(
									new ErrorView({
										message: "Your package changes could not be saved."
									})
								);
							}
						}
					});
				}
			}
			if (changes === 0) {

				// show notify of no changes view
				//
				Registry.application.modal.show(
					new NotifyView({
						message: "There are no new package changes to save."
					})
				);
			}
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				data: this.options.data,
				showNumbering: Registry.application.getShowNumbering()
			}));
		},

		onRender: function() {
			var self = this;

			// change accordion icon
			//
			new Accordions(this.$el.find('.accordion'));

			// show package filters view
			//
			this.packageFilters.show(
				new ReviewPackagesFiltersView({
					model: this.model,
					data: this.options.data? this.options.data : {},

					// callbacks
					//
					onChange: function() {
						setQueryString(self.packageFilters.currentView.getQueryString());			
					}
				})
			);

			// fetch and show packages
			//
			this.fetchPackages(function() {
				self.showReviewPackagesList();
			});
		},
		
		showReviewPackagesList: function() {

			// show review packages list view
			//
			this.reviewPackagesList.show(
				new ReviewPackagesListView({
					collection: this.collection,
					showDeactivatedPackages: this.$el.find('#show-deactivated-packages').is(':checked'),
					showNumbering: Registry.application.getShowNumbering(),
					showDelete: true
				})
			);
		},

		//
		// event handling methods
		//

		onClickSave: function() {
			this.savePackages();
		},

		onClickCancel: function() {

			// go home
			//
			Backbone.history.navigate('#home', {
				trigger: true
			});
		},

		onClickShowDeactivatedPackages: function() {
			this.reviewPackagesList.currentView.options.showDeactivatedPackages = this.$el.find('#show-deactivated-packages').is(':checked');
			this.reviewPackagesList.currentView.render();
		},

		onClickShowNumbering: function(event) {
			Registry.application.setShowNumbering($(event.target).is(':checked'));
			this.showReviewPackagesList();
		}
	});
});
