/******************************************************************************\
|                                                                              |
|                             assessments-list-view.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a project's current list of.        |
|        assessments.                                                          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/assessments/list/assessments-list.tpl',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/assessments/list/assessments-list-item-view'
], function($, _, Backbone, Marionette, Template, SortableTableListView, AssessmentsListItemView) {
	return SortableTableListView.extend({

		//
		// attributes
		//

		childView: AssessmentsListItemView,

		sorting: {

			// disable sorting on delete column
			//
			headers: {
				3: { 
					sorter: false 
				}
			},

			// sort on name in ascending order 
			//
			sortList: [[0, 0]]
		},
		
		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				collection: this.collection,
				showNumbering: this.options.showNumbering
			}));
		},

		childViewOptions: function(model, index) {
			return {
				index: index,
				showNumbering: this.options.showNumbering
			}
		}
	});
});