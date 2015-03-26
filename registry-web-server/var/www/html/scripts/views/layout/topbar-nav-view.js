/******************************************************************************\
|                                                                              |
|                               topbar-nav-view.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing the topbar navigation.              |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'popover',
	'text!templates/layout/topbar-nav.tpl',
	'scripts/registry',
	'scripts/views/dialogs/notify-view'
], function($, _, Backbone, Marionette, PopOver, Template, Registry, NotifyView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		events: {
			'click #packages': 'onClickPackages',
			'click #assessments': 'onClickAssessments',
			'click #results': 'onClickResults',
			'click #runs': 'onClickRuns',
			'click #projects': 'onClickProjects',
			'click #events': 'onClickEvents',
			'click #settings': 'onClickSettings',
			'click #overview': 'onClickOverview',
			'click #side-nav': 'onClickSideNav'
		},

		setLayout: function(layout) {
			Registry.application.setLayout(layout);

			// clear popovers
			//
			$(".popover").remove();

			// refresh
			//
			var fragment = Backbone.history.fragment;
			Backbone.history.fragment = null;
			Backbone.history.navigate(fragment, true);
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				nav: this.options.nav,
				showHome: this.options.showHome,
				isAdmin: Registry.application.session.user.isAdmin()
			}));
		},

		onRender: function() {

			// initialize popovers
			//
			this.$el.find(".active").popover({
				trigger: 'hover',
				animation: true
			});
		},

		//
		// event handling methods
		//

		onClickPackages: function() {

			// go to my packages view
			//
			Backbone.history.navigate('#packages', {
				trigger: true
			});	
		},

		onClickAssessments: function() {

			// go to my assessments view
			//
			Backbone.history.navigate('#assessments', {
				trigger: true
			});
		},

		onClickResults: function() {

			// go to my results view
			//
			Backbone.history.navigate('#results', {
				trigger: true
			});
		},

		onClickRuns: function() {

			// go to my scheduled runs view
			//
			Backbone.history.navigate('#run-requests', {
				trigger: true
			});
		},

		onClickProjects: function() {

			// go to my projects view
			//
			Backbone.history.navigate('#projects', {
				trigger: true
			});	
		},

		onClickEvents: function() {

			// go to my events view
			//
			Backbone.history.navigate('#events?project=any', {
				trigger: true
			});	
		},

		onClickSettings: function() {

			// go to settings view
			//
			Backbone.history.navigate('#settings', {
				trigger: true
			});			
		},

		onClickOverview: function() {

			// go to overview view
			//
			Backbone.history.navigate('#overview', {
				trigger: true
			});
		},

		//
		// navbar positioning event handling methods
		//

		onClickSideNav: function() {
			this.setLayout('two-columns-left-sidebar');
		}
	});
});
