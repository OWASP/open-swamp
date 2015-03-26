/******************************************************************************\
|                                                                              |
|                            sortable-table-list-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an abstract view for displaying sortable lists.          |
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
	'scripts/views/widgets/lists/table-list-view'
], function($, _, Backbone, Marionette, TableSorter, TableListView) {
	var Class = TableListView.extend({

		//
		// attributes
		//

		sorting: {

			// sort on first version column in ascending order 
			//
			sortList: [[0, 0]] 
		},

		//
		// methods
		//

		initialize: function() {

			// call superclass method
			//
			TableListView.prototype.initialize.call(this);

			// renumber after sorting
			//
			var self = this;
			this.$el.bind('sortEnd',function() {
				self.renumber();
			});

			// add specialized sort parsers
			//
			if (this.sortParsers) {
				for (var i = 0; i < this.sortParsers.length; i++) {
					$.tablesorter.addParser(this.sortParsers[i]);
				}
			}
		},

		update: function() {
				
			// call superclass method
			//
			TableListView.prototype.update.call(this);

			// update tablesorter cache upon update
			//
			this.$el.find('.tablesorter').trigger('update');
		},

		sortItems: function(sorting) {

			// apply table sorter tag
			//
			this.$el.find('table').addClass('tablesorter');

			// apply table sorter plug-in
			//
			if (this.options.showNumbering) {
				this.$el.find('.tablesorter:has(tbody tr)').tablesorter(this.getNumberedSorting(sorting));
			} else {
				this.$el.find('.tablesorter:has(tbody tr)').tablesorter(sorting);
			}
		},

		getNumberedSorting: function(sorting) {

			// disable sorting on number column
			//
			var headers = {
				0: {
					sorter: false
				}
			};

			// add sorters of other columns
			//
			if (sorting.headers) {
				for (var key in sorting.headers) {
					headers[parseInt(key) + 1] = {
						sorter: sorting.headers[key].sorter
					}
				}
			}

			// add one to sort column
			//
			if (sorting.sortList) {
				var column = sorting.sortList[0][0];
				var direction = sorting.sortList[0][1];
				var sortList = [[column + 1, direction]];
			}

			// return sorting info
			//
			return {
				headers: headers,
				sortList: sortList
			}
		},

		//
		// rendering methods
		//

		onRender: function() {
			this.sortItems(this.sorting);
		}
	});

	return Class;
});