/******************************************************************************\
|                                                                              |
|                            select-projects-item-view.js                      |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for showing a single selectable project           |
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
	'text!templates/projects/select-list/select-projects-list-item.tpl'
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
			return _.template(Template, data);
		},

		//
		// methods
		//

		isSelected: function() {
			return this.$el.find('input').is(':checked');
		},

		setSelected: function(selected) {
			if (selected) {
				this.$el.find('input').attr('checked', 'checked');
			} else {
				this.$el.find('input').removeAttr('checked');
			}
		}
	});
});