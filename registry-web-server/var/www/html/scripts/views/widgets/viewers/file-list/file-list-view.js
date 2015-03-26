/******************************************************************************\
|                                                                              |
|                                file-list-view.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for a list of file items.                         |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/widgets/viewers/file-list/file-list.tpl',
	'scripts/views/widgets/viewers/file-list/file-list-item-view'
], function($, _, Backbone, Marionette, Template, FileListItemView) {
	return TableListView.extend({

		//
		// attributes
		//

		childView: FileListItemView,
		
		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				collection: this.collection
			}));
		},

		attachHtml: function(collectionView, childView){
			collectionView.$('tbody').append(childView.el);
		}
	});
});