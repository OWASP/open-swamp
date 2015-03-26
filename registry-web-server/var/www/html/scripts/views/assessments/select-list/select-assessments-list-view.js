/******************************************************************************\
|                                                                              |
|                          select-assessments-list-view.js                     |
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
	'text!templates/assessments/select-list/select-assessments-list.tpl',
	'scripts/collections/assessments/assessment-runs',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/assessments/select-list/select-assessments-list-item-view'
], function($, _, Backbone, Marionette, Template, AssessmentRuns, SortableTableListView, SelectAssessmentsListItemView) {
	return SortableTableListView.extend({

		//
		// attributes
		//

		childView: SelectAssessmentsListItemView,

		events: {
			'click .select-all': 'onClickSelectAll'
		},

		sorting: {

			// disable sorting on select column
			//
			headers: { 
				0: { 
					sorter: false 
				},
				4: { 
					sorter: false 
				},
				5: { 
					sorter: false 
				}
			},

			// sort on name column in ascending order 
			//
			sortList: [[1, 0]]
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				collection: this.collection,
				selectedAssessmentRunUuids: this.options.selectedAssessmentRunUuids,
				showNumbering: this.options.showNumbering,
				showDelete: this.options.showDelete
			}));
		},

		childViewOptions: function(model, index) {
			return {
				index: index,
				showNumbering: this.options.showNumbering,
				showDelete: this.options.showDelete,
				project: this.options.project,
				data: this.options.data
			}
		},

		onRender: function() {			

			// mark selected assessments
			//
			if (this.options.selectedAssessmentRunUuids) {
				this.selectAssessmentRunsByUuids(this.options.selectedAssessmentRunUuids);
			}

			// call superclass method
			//
			SortableTableListView.prototype.onRender.call(this);
		},

		// 
		// querying methods
		//

		selectAssessmentRunsByUuids: function(uuids) {
			for (var i = 0; i < uuids.length; i++) {
				this.selectAssessmentRunByUuid(uuids[i]);
			}		
		},

		selectAssessmentRunByUuid: function(uuid) {
			for (var i = 0; i < this.children.length; i++) {
				var child = this.children.findByIndex(i);
				if (child.model.get('assessment_run_uuid') === uuid) {
					child.setSelected(true);
				}
			}		
		},

		getSelected: function() {
			var collection = new AssessmentRuns();
			for (var i = 0; i < this.children.length; i++) {
				var child = this.children.findByIndex(i);
				if (child.isSelected()) {
					collection.add(child.model);
				}
			}
			return collection;
		},

		//
		// event handling methods
		//

		onClickSelectAll: function(event) {
			if ($(event.target).prop('checked')) {

				// select all
				//
				this.$el.find('input').prop('checked', true);
			} else {
				
				// deselect all
				//
				this.$el.find('input').prop('checked', false);
			}
		}
	});
});