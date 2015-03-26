/******************************************************************************\
|                                                                              |
|                                   policy-view.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the generic policy view used to view all policies        |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'clickover',
	'text!templates/policies/policy-view.tpl'
], function($, _, Backbone, Marionette, Clickover, Template) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				policyTitle: this.options.policyTitle,
				policyText: this.options.policyText
			}));
		},

		onRender: function() {
			var self = this;

			if (this.options.template_file) {
				
				// get policy from file
				//
				require([this.options.template_file], function(policyText) {
					self.$el.find('#policy').html(policyText);

					self.$el.find('a[data-toggle]').popover({
						trigger: 'click'
					});
				}, function(err) {
					Backbone.history.navigate('#home', {
						trigger: true
					});
				});
			}
		}
	});
});
