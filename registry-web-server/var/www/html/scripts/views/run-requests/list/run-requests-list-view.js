/******************************************************************************\
|                                                                              |
|                             run-requests-list-view.js                        |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a list of run requests.             |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/run-requests/run-requests-list/run-requests-list.tpl',
	'scripts/registry',
	'scripts/collections/run-requests/run-requests',
	'scripts/views/dialogs/error-view',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/scheduled-runs/run-requests-list/run-requests-list-item-view'
], function($, _, Backbone, Marionette, Template, Registry, RunRequests, ErrorView, SortableTableListView, RunRequestsListItemView) {
	return SortableTableListView.extend({

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				collection: this.collection,
				showDelete: this.options.showDelete
			}));
		},

		onRender: function() {
			this.count = 0;

			// show run requests
			//
			for (var i = 0; i < this.collection.length; i++) {
				this.showAssessmentRunRequests(this.collection.at(i));
			}
		},

		showAssessmentRunRequests: function(assessmentRun) {
			var self = this;
			var runRequests = new RunRequests();

			// fetch run requests associated with assessment run
			//
			runRequests.fetchByAssessmentRun(assessmentRun, {

				// callbacks
				//
				success: function() {

					// show each run request
					//
					for (var i = 0; i < runRequests.length; i++) {
						self.showAssessmentRunRequest(assessmentRun, runRequests.at(i));
					}

					// sort table when complete
					//
					self.count++;
					if (self.count === self.collection.length) {

						// make table sortable
						//
						self.$el.find('table').addClass('tablesorter');
						self.$el.find('.tablesorter:has(tbody tr)').tablesorter({

							// disable sorting on remove column
							//
							headers: { 
								4: { 
									sorter: false 
								}
							},

							// sort on name column in descending order 
							//
							sortList: [[0, 0]] 
						});
					}
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not get run requests associated with assessment run."
						})
					);
				}
			})
		},

		showAssessmentRunRequest: function(assessmentRun, runRequest) {
			var runRequestsListItemView = new RunRequestsListItemView({
				model: assessmentRun,
				runRequest: runRequest,
				showDelete: this.options.showDelete,
				parent: this
			});
			this.$el.find('table').show();
			this.$el.find('.no-run-requests-message').hide();
			this.$el.find('table tbody').append(runRequestsListItemView.render().el);
		}
	});
});