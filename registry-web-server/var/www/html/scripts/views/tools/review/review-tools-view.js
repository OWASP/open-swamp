/******************************************************************************\
|                                                                              |
|                               review-tools-view.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for reviewing, accepting, or declining            |
|        tool approval.                                                        |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/tools/review/review-tools.tpl',
	'scripts/registry',
	'scripts/utilities/query-strings',
	'scripts/utilities/url-strings',
	'scripts/widgets/accordions',
	'scripts/collections/tools/tools',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/tools/filters/tool-filters-view',
	'scripts/views/tools/review/review-tools-list/review-tools-list-view'
], function($, _, Backbone, Marionette, Template, Registry, QueryStrings, UrlStrings, Accordions, Tools, NotifyView, ErrorView, ToolFiltersView, ReviewToolsListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			toolFilters: '#tool-filters',
			reviewToolsList: '#review-tools-list'
		},

		events: {
			'click #save': 'onClickSave',
			'click #cancel': 'onClickCancel',
			'click #show-deactivated-tools': 'onClickShowDeactivatedTools',
			'click #show-numbering': 'onClickShowNumbering'
		},

		//
		// methods
		//

		initialize: function() {
			this.collection = new Tools();
		},

		//
		// ajax methods
		//

		fetchTools: function(done) {
			var self = this;

			// fetch tools
			//
			this.collection.fetchAll({
				data: this.toolFilters.currentView? this.toolFilters.currentView.getData() : null,

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
							message: "Could not fetch tools."
						})
					);
				}
			});	
		},

		saveTools: function() {
			var self = this;

			// save tools
			//
			/*
			this.collection.save({

				// callbacks
				//
				success: function() {

					// show success notification dialog
					//
					Registry.application.modal.show(
						new NotifyView({
							title: "Tool Changes Saved",
							message: "Your tool changes have been successfully saved."
						})
					);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Your tool changes could not be saved."
						})
					);
				}
			});
			*/

			// save tools individually
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
										title: "Tool Changes Saved",
										message: "Your tool changes have been successfully saved."
									})
								);
							}
						},

						error: function() {
							errors++;

							// report first error
							//
							if (errors === 1) {

								// show error dialog view
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Your tool changes could not be saved."
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
						message: "There are no new tool changes to save."
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
			this.toolFilters.show(
				new ToolFiltersView({
					model: this.model,
					data: this.options.data? this.options.data : {},

					// callbacks
					//
					onChange: function() {
						setQueryString(self.toolFilters.currentView.getQueryString());			
					}
				})
			);

			// fetch and show tools
			//
			this.fetchTools(function() {
				self.showReviewToolsList();
			});
		},

		showReviewToolsList: function() {

			// show review tools list view
			//
			this.reviewToolsList.show(
				new ReviewToolsListView({
					collection: this.collection,
					showDeactivatedTools: this.$el.find('#show-deactivated-tools').is(':checked'),
					showNumbering: Registry.application.getShowNumbering(),
					showDelete: true
				})
			);
		},

		//
		// event handling methods
		//

		onClickSave: function() {
			this.saveTools();
		},

		onClickCancel: function() {

			// go home
			//
			Backbone.history.navigate('#home', {
				trigger: true
			});
		},

		onClickShowDeactivatedTools: function() {
			this.reviewToolsList.currentView.options.showDeactivatedTools = this.$el.find('#show-deactivated-tools').is(':checked');
			this.reviewToolsList.currentView.render();
		},

		onClickShowNumbering: function(event) {
			Registry.application.setShowNumbering($(event.target).is(':checked'));
			this.showReviewToolsList();
		}
	});
});
