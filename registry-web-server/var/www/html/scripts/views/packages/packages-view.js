/******************************************************************************\
|                                                                              |
|                                  packages-view.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This is a view for showing a list of user packages.                   |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/packages/packages.tpl',
	'scripts/registry',
	'scripts/utilities/query-strings',
	'scripts/utilities/url-strings',
	'scripts/widgets/accordions',
	'scripts/models/projects/project',
	'scripts/collections/projects/projects',
	'scripts/collections/packages/packages',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/packages/filters/package-filters-view',
	'scripts/views/packages/list/packages-list-view'
], function($, _, Backbone, Marionette, Template, Registry, QueryStrings, UrlStrings, Accordions, Project, Projects, Packages, ConfirmView, ErrorView, PackageFiltersView, PackagesListView) {
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
			'click #add-new-package': 'onClickAddNewPackage',
			'click #show-numbering': 'onClickShowNumbering'
		},

		//
		// methods
		//

		initialize: function() {
			this.collection = new Packages();
		},

		//
		// query string / filter methods
		//

		getFilterData: function() {
			if (this.packageFilters.currentView) {
				var data = this.packageFilters.currentView.getData();

				// nuke unneeded project attribute
				//
				delete data['project_uuid'];

				return data;
			}
		},

		//
		// ajax methods
		//

		fetchPackages: function(done) {
			var self = this;

			if (this.options.data['project']) {

				// fetch packages for a single project
				//
				this.collection.fetchProtected(this.options.data['project'], {

					// attributes
					//
					data: this.getFilterData(),

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
								message: "Could not get packages for this project."
							})
						);
					}
				});
			} else if (this.options.data['projects'] && this.options.data['projects'].length > 0) {

				// fetch assessments for all projects
				//
				this.collection.fetchAllProtected(this.options.data['projects'], {

					// attributes
					//
					data: this.getFilterData(),

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
								message: "Could not get packages for all projects."
							})
						);
					}
				});
			} else {
				done();
			}
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				project: this.options.data['project'],
				packageType: this.options.data['type'],
				loggedIn: Registry.application.session.user != null,
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
				new PackageFiltersView({
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
				self.showPackagesList();
			});
		},

		showPackagesList: function() {
			this.packagesList.show(
				new PackagesListView({
					collection: this.collection,
					showNumbering: Registry.application.getShowNumbering(),
					showDelete: true,
				})
			);
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
		},

		onClickAddNewPackage: function() {

			// go to add new package view
			//
			Backbone.history.navigate('#packages/add', {
				trigger: true
			});
		},

		onClickShowNumbering: function(event) {
			Registry.application.setShowNumbering($(event.target).is(':checked'));
			this.showPackagesList();
		}
	});
});
