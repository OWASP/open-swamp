/******************************************************************************\
|                                                                              |
|                             review-projects-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for reviewing, accepting, or declining            |
|        project approval.                                                     |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/projects/review/review-projects.tpl',
	'scripts/registry',
	'scripts/widgets/accordions',
	'scripts/collections/projects/projects',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/projects/filters/project-filters-view',
	'scripts/views/projects/review/review-projects-list/review-projects-list-view'
], function($, _, Backbone, Marionette, Template, Registry, Accordions, Projects, NotifyView, ErrorView, ProjectFiltersView, ReviewProjectsListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			projectFilters: '#project-filters',
			reviewProjectsList: '#review-projects-list'
		},

		events: {
			'click #save': 'onClickSave',
			'click #cancel': 'onClickCancel',
			'click #show-deactivated-projects': 'onClickShowDeactivatedProjects',
			'click #show-numbering': 'onClickShowNumbering'
		},

		//
		// methods
		//

		initialize: function() {
			this.collection = new Projects();
		},

		fetchProjects: function(done) {

			// fetch projects
			//
			this.collection.fetchAll({
				data: this.projectFilters.currentView? this.projectFilters.currentView.getData() : null,

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
							message: "Could not fetch projects."
						})
					);
				}
			});	
		},

		saveProjects: function() {
			var self = this;

			// save projects
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
							title: "Project Changes Saved",
							message: "Your project changes have been successfully saved."
						})
					);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Your project changes could not be saved."
						})
					);
				}
			});
			*/

			// save projects individually
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
										title: "Project Changes Saved",
										message: "Your project changes have been successfully saved."
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
										message: "Your project changes could not be saved."
									})
								);
							}
						}
					});
				}
			}
			if (changes === 0) {

				// show notification dialog
				//
				Registry.application.modal.show(
					new NotifyView({
						message: "There are no new project changes to save."
					})
				);
			}
		},

		//
		// rendering methods
		//

		template: function(){
			return _.template(Template,{
				showDeactivatedProjects: this.options.showDeactivatedProjects ? true : false,
				showNumbering: Registry.application.getShowNumbering()
			});
		},
		
		onRender: function() {
			var self = this;

			// change accordion icon
			//
			new Accordions(this.$el.find('.accordion'));

			// show project filters view
			//
			this.projectFilters.show(
				new ProjectFiltersView({
					model: this.model,
					data: this.options.data? this.options.data : {},

					// callbacks
					//
					onChange: function() {
						setQueryString(self.projectFilters.currentView.getQueryString());			
					}
				})
			);

			// fetch and show projects
			//
			this.fetchProjects(function() {
				self.showReviewProjectsList();
			});
		},

		showReviewProjectsList: function() {

			// show review projects list view
			//
			this.reviewProjectsList.show(
				new ReviewProjectsListView({
					collection: this.collection,
					showDeactivatedProjects: this.options.showDeactivatedProjects,
					showNumbering: Registry.application.getShowNumbering()
				})
			);
		},

		//
		// event handling methods
		//

		onClickSave: function() {
			this.saveProjects();
		},

		onClickCancel: function() {

			// go home
			//
			Backbone.history.navigate('#home', {
				trigger: true
			});
		},

		onClickShowDeactivatedProjects: function( e ) {
			this.options.showDeactivatedProjects = e.target.checked;
			this.render();
		},

		onClickShowNumbering: function(event) {
			Registry.application.setShowNumbering($(event.target).is(':checked'));
			this.showReviewProjectsList();
		}
	});
});
