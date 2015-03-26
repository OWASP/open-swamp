/******************************************************************************\
|                                                                              |
|                                  table-list-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an abstract view for displaying a generic list.          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'scripts/views/widgets/lists/list-view'
], function($, _, Backbone, Marionette, ListView) {
	return ListView.extend({

		//
		// rendering methods
		//

		attachHtml: function(collectionView, childView) {
			collectionView.$('tbody').append(childView.el);
		}
	});
});