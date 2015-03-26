/******************************************************************************\
|                                                                              |
|                           review-projects-list-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for displaying a list of projects for review.     |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'tablesorter',
	'text!templates/projects/review/review-projects-list/review-projects-list.tpl',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/projects/review/review-projects-list/review-projects-list-item-view'
], function($, _, Backbone, Marionette, TableSorter, Template, SortableTableListView, ReviewProjectsListItemView) {
	return SortableTableListView.extend({

		//
		// attributes
		//

		childView: ReviewProjectsListItemView,

		sorting: {

			// disable sorting on delete column
			//
			headers: { 
				4: { 
					sorter: false 
				}
			},

			// sort on date column in descending order 
			//
			sortList: [[2, 1]]
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
				collection: this.collection,
				showDeactivatedProjects: this.options.showDeactivatedProjects,
				showNumbering: this.options.showNumbering,
				parent: this
			}
		},

		onRender: function() {

			// remove broken rows and shout out the indicies
			//
			this.$el.find('table').find('tbody tr').each( 
				function(index){
					if ($(this).children().length === 0) {
						console.log( index );
						$(this).remove(); 
					}
				} 
			);

			// call superclass method
			//
			SortableTableListView.prototype.onRender.call(this);
		}
	});
});
