/******************************************************************************\
|                                                                              |
|                                   about-view.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the about/information view of the application.           |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/info/about.tpl',
	'scripts/registry',
	'scripts/version',
], function($, _, Backbone, Marionette, Template, Registry, Version) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		events: {
			'click .subscribe': 'onClickSubscribe'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				Version: Version,
			}));
		},

		//
		// methods
		//

		onShow: function() {

			// scroll to anchor
			//
			if (this.options.anchor) {
				var el = this.$el.find("[name='" + this.options.anchor + "']");
				// el[0].scrollIntoView(true);
				$(document.body).scrollTop(el.offset().top - 36);
			}
		},

		//
		// event handling methods
		//

		onClickSubscribe: function() {
			Backbone.history.navigate('#mailing-list/subscribe', {
				trigger: true
			});
		}
	});
});
