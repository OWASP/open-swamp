/******************************************************************************\
|                                                                              |
|                                public-packages-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This is a view for showing a list of public curated packages.         |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/info/resources/packages.tpl',
	'scripts/registry',
	'scripts/collections/packages/packages',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/packages/filters/public-package-filters-view',
	'scripts/views/packages/list/packages-list-view'
], function($, _, Backbone, Marionette, Template, Registry, Packages, ConfirmView, ErrorView, PublicPackageFiltersView, PackagesListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//
		
		template: _.template(Template),

		regions: {
			packageFilters: '#package-filters',
			packagesList: '#packages-list'
		},

		events: {
			'click #reset-filters': 'onClickResetFilters',
		},

		//
		// methods
		//

		initialize: function() {
			this.collection = new Packages();
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				loggedIn: Registry.application.session.user != null
			}));
		},

		onRender: function() {
			var self = this;

			// show package filters view
			//
			this.packageFilters.show(
				new PublicPackageFiltersView({
					model: this.model,
					data: this.options.data? this.options.data : {},

					// callbacks
					//
					onChange: function() {
						setQueryString(self.packageFilters.currentView.getQueryString());				
					}
				})
			);

			// show subviews
			//
			this.showPackagesList();
		},

		showPackagesList: function() {
			var self = this;
			this.collection.fetchPublic({
				data: this.packageFilters.currentView? this.packageFilters.currentView.getData() : null,

				// callbacks
				//
				success: function() {

					// show list of packages
					//
					self.packagesList.show(
						new PackagesListView({
							collection: self.collection
						})
					);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not get list of packages."
						})
					);
				}
			})
		},

		//
		// event handling methods
		//

		onClickResetFilters: function() {
			var self = this;

			// show confirm dialog
			//
			Registry.application.modal.show(
				new ConfirmView({
					title: "Reset filters",
					message: "Are you sure that you would like to reset your filters?",

					// callbacks
					//
					accept: function() {
						self.packageFilters.currentView.reset();
					}
				})
			);
		}
	});
});
