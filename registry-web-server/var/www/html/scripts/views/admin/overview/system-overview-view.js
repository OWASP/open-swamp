/******************************************************************************\
|                                                                              |
|                               system-overview-view.js                        |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for displaying the system overview view.        |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/admin/overview/system-overview.tpl'
], function($, _, Backbone, Marionette, Template) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		template: _.template(Template),

		events: {
			'click #accounts': 'onClickAccounts',
			'click #projects': 'onClickProjects',
			'click #packages' : 'onClickPackages',
			'click #tools' : 'onClickTools',
			'click #results' : 'onClickResults'
		},

		//
		// event handling methods
		//

		onClickAccounts: function() {
			Backbone.history.navigate('#accounts/review', {
				trigger: true
			});
		},

		onClickProjects: function() {
			Backbone.history.navigate('#projects/review', {
				trigger: true
			});
		},

		onClickPackages: function() {
			Backbone.history.navigate('#packages/review', {
				trigger: true
			});
		},

		onClickTools: function() {
			Backbone.history.navigate('#tools/review', {
				trigger: true
			});
		},

		onClickResults: function() {
			Backbone.history.navigate('#results/review', {
				trigger: true
			});
		}
	});
});
