/******************************************************************************\
|                                                                              |
|                            package-versions-list-view.js                     |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a list of package versions.         |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/packages/info/versions/list/package-versions-list.tpl',
	'scripts/registry',
	'scripts/models/utilities/version',
	'scripts/views/widgets/lists/sortable-table-list-view',
	'scripts/views/packages/info/versions/list/package-versions-list-item-view'
], function($, _, Backbone, Marionette, Template, Registry, Version, SortableTableListView, PackageVersionsListItemView) {
	return SortableTableListView.extend({

		//
		// attributes
		//

		childView: PackageVersionsListItemView,

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
				model: this.model,
				collection: this.collection,
				showDelete: this.model.isOwned()
			}));
		},

		childViewOptions: function(model) {
			return {
				model: model,
				package: this.model,
				collection: this.collection
			}   
		}
	});
});