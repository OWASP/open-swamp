/******************************************************************************\
|                                                                              |
|                          platform-versions-list-view.js                      |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a list of platform versions.        |
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
	'text!templates/platforms/info/versions/platform-versions-list/platform-versions-list.tpl',
	'scripts/registry',
	'scripts/models/utilities/version',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/platforms/info/versions/platform-versions-list/platform-versions-list-item-view'
], function($, _, Backbone, Marionette, TableSorter, Template, Registry, Version, SortableTableListView, PlatformVersionsListItemView) {
	return SortableTableListView.extend({

		//
		// attributes
		//

		childView: PlatformVersionsListItemView,

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
				collection: this.collection
			}));
		},

		childViewOptions: function(model) {
			return {
				model: model,
				platform: this.model
			}   
		}
	});
});