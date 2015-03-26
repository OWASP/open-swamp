/******************************************************************************\
|                                                                              |
|                                    list-view.js                              |
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
], function($, _, Backbone, Marionette) {
	return Backbone.Marionette.CompositeView.extend({

		//
		// methods
		//

		initialize: function() {

			// trigger update upon item remove
			//
			this.collection.bind('remove', function() {
				this.update();
			}, this);
		},

		update: function() {

			// re-render if list is empty
			//
			if (this.collection.length == 0) {
				this.render();
			}

			// renumber (if list is numbered)
			//
			this.renumber();
		},

		renumber: function() {
			var count = 1;
			this.$el.find('td.number').each(function() {
				$(this).html(count++);
			});
		},
	});
});