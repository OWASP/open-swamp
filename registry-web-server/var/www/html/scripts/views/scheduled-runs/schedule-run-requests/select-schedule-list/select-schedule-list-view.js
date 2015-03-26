/******************************************************************************\
|                                                                              |
|                           select-schedule-list-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a selectable list of                |
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
	'text!templates/run-requests/schedule-run-requests/select-schedule-list/select-schedule-list.tpl',
	'scripts/views/widgets/lists/table-list-view',
	'scripts/views/scheduled-runs/schedule-run-requests/select-schedule-list/select-schedule-list-item-view'
], function($, _, Backbone, Marionette, Template, TableListView, SelectScheduleListItemView) {
	return TableListView.extend({

		//
		// attributes
		//

		childView: SelectScheduleListItemView,

		//
		// methods
		//

		childViewOptions: function(model, index) {
			return {
				project: this.options.project,
				itemIndex: index,
				selectedAssessmentRunUuids: this.options.selectedAssessmentRunUuids,
				showDelete: this.options.showDelete
			}
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				collection: this.collection,
				showDelete: this.options.showDelete
			}));
		},

		//
		// querying methods
		//

		getSelected: function() {
			var selectedRadioButton = this.$el.find('input:checked');
			var index = selectedRadioButton.attr('index');
			return this.collection.at(index);
		}
	});
});