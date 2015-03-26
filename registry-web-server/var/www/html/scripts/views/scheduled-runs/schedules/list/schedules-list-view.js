/******************************************************************************\
|                                                                              |
|                              schedules-list-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a project's current list of.        |
|        run request schedules.                                                |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/run-requests/schedules/list/schedules-list.tpl',
	'scripts/views/widgets/lists/table-list-view',
	'scripts/views/scheduled-runs/schedules/list/schedules-list-item-view'
], function($, _, Backbone, Marionette, Template, TableListView, SchedulesListItemView) {
	return TableListView.extend({

		//
		// attributes
		//

		childView: SchedulesListItemView,

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				collection: this.collection,
				showNumbering: this.options.showNumbering,
				showDelete: this.options.showDelete
			}));
		},

		childViewOptions: function(model, index) {
			return {
				index: index,
				project: this.options.project,
				selectedAssessmentRunUuids: this.options.selectedAssessmentRunUuids,
				showNumbering: this.options.showNumbering,
				showDelete: this.options.showDelete
			}
		}
	});
});