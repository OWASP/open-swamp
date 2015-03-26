/******************************************************************************\
|                                                                              |
|                            tool-versions-list-view.js                        |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a list of tool versions.            |
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
	'text!templates/tools/info/versions/tool-versions-list/tool-versions-list.tpl',
	'scripts/registry',
	'scripts/models/utilities/version',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/tools/info/versions/tool-versions-list/tool-versions-list-item-view'
], function($, _, Backbone, Marionette, TableSorter, Template, Registry, Version, SortableTableListView, ToolVersionsListItemView) {
	return SortableTableListView.extend({

		//
		// attributes
		//

		childView: ToolVersionsListItemView,

		sorting: {

			// disable sorting on delete column
			//
			headers: {
				0: {
					sorter: 'versions'
				},

				3: { 
					sorter: false 
				}
			},

			// sort on version column in descending order 
			//
			sortList: [[0, 1]]
		},

		sortParsers: [{

			// set a unique id 
			//
			id: 'versions',

			is: function(s) {

				// return false so this parser is not auto detected 
				//
				return false;
			},

			format: function(string) {
				return Version.comparator(string);
			},

			// set type, either numeric or text
			//
			type: 'numeric'
		}],

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				user: Registry.application.session.user,
				model: this.model,
				collection: this.collection,
				showDelete: this.model.isOwned()
			}));
		},

		childViewOptions: function(model) {
			return {
				user: Registry.application.session.user,
				model: model,
				tool: this.model
			}   
		}
	});
});