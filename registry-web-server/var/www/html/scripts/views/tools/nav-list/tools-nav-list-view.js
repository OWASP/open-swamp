/******************************************************************************\
|                                                                              |
|                              tools-nav-list-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing lists of the user's tools.          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/tools/nav-list/tools-nav-list.tpl'
], function($, _, Backbone, Marionette, Template) {
	return Backbone.Marionette.ItemView.extend({

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				user: this.model,
				collection: this.collection
			}));
		},

		onRender: function() {

			// update sidebar navigation highlighting
			//
			if (this.options.nav) {
				this.$el.find('.nav li').removeClass('active');
				this.$el.find('.nav li.' + this.options.nav).addClass('active');
			}
		}
	});
});