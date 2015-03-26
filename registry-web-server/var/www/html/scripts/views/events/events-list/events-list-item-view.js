/******************************************************************************\
|                                                                              |
|                              events-list-item-view.js                        |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view that shows an instance of a single event.         |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/events/events-list/events-list-item.tpl'
], function($, _, Backbone, Marionette, Template) {
	return Backbone.Marionette.ItemView.extend({

		// 
		// methods
		//

		getTitle: function() {
			return 'Title';
		},

		getDescription: function() {
			return 'Description'
		},

		getDate: function() {
			return this.model.get('date');
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				title: this.getTitle(),
				description: this.getDescription(),
				date: this.getDate()
			}));
		}
	});
});