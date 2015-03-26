/******************************************************************************\
|                                                                              |
|                         run-request-schedules-list-view.js                   |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for showing a list of run request schedules.      |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/run-requests/schedules/schedule/run-request-schedules-list/run-request-schedules-list.tpl',
	'scripts/views/widgets/lists/table-list-view',
	'scripts/views/scheduled-runs/schedules/schedule/run-request-schedules-list/run-request-schedule-item-view'
], function($, _, Backbone, Marionette, Template, TableListView, RunRequestScheduleItemView) {
	return TableListView.extend({

		//
		// attributes
		//

		childView: RunRequestScheduleItemView,

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				collection: this.collection
			}));
		}
	});
});