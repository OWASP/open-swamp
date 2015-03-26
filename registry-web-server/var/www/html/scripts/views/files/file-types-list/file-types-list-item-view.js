/******************************************************************************\ 
|                                                                              |
|                           file-types-list-item-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a particular file type              |
|        list item.                                                            |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/files/file-types-list/file-types-list-item.tpl'
], function($, _, Backbone, Marionette, Template) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		tagName: 'tr',

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model
			}));
		}
	});
});
