/******************************************************************************\
|                                                                              |
|                                file-tree-view.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for a tree of file items.                         |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/widgets/viewers/file-tree/file-tree.tpl',
], function($, _, Backbone, Marionette, Template) {
	return Backbone.Marionette.ItemView.extend({

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				'model': this.model
			}));
		}
	});
});